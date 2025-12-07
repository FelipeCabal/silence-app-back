import { UsersService } from './users.service';
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Status } from 'src/config/enums/status.enum';
import { InjectModel } from '@nestjs/mongoose';
import { FriendRequest } from '../entities/solicitud.schema';
import { Model } from 'mongoose';
import { UserSchema } from '../entities/users.schema';
import { RedisService } from '../../redis/redis.service';
import { ChatPrivateService } from 'src/chats/chat-private/chat-private.service';

@Injectable()
export class SolicitudesAmistadService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    @InjectModel(UserSchema.name) private readonly userModel: Model<UserSchema>,

    @Inject(forwardRef(() => ChatPrivateService))
    private readonly privateChatsService: ChatPrivateService,

    @InjectModel(FriendRequest.name)
    private readonly requestModel: Model<FriendRequest>,

    private readonly redisService: RedisService,
  ) {}

  private readonly TTL_REQUEST_SECONDS = 600;

  private buildPairKey(user1Id: string, user2Id: string) {
    const [a, b] = [user1Id, user2Id].sort();
    return `friendreq:pair:${a}:${b}`;
  }

  private async cacheSet(key: string, value: any, ttl: number) {
    try {
      await this.redisService.client.set(key, JSON.stringify(value), 'EX', ttl);
    } catch {}
  }

  private async cacheGet<T = any>(key: string): Promise<T | null> {
    try {
      const raw = await this.redisService.client.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private async invalidate(keys: string[]) {
    try {
      if (keys.length) await this.redisService.client.del(...keys);
    } catch {}
  }

  async sendFriendRequest(userSendId: string, userReceiveId: string) {
    if (userSendId == userReceiveId) {
      throw new HttpException(
        "You can't send a friend request to yourself",
        HttpStatus.BAD_REQUEST,
      );
    }
    const userSend = await this.usersService.findOneUser(userSendId);
    const userReceive = await this.usersService.findOneUser(userReceiveId);

    if (!userSend || !userReceive) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const requestExisting = await this.requestModel.findOne({
      $or: [
        {
          userEnvia: userSendId,
          userRecibe: userReceiveId,
          status: Status.Pendiente,
        },
        {
          userEnvia: userReceiveId,
          userRecibe: userSendId,
          status: Status.Pendiente,
        },
      ],
    });

    if (requestExisting) {
      throw new HttpException(
        'ya enviaste la solicitud de amistad',
        HttpStatus.CONFLICT,
      );
    }

    const friendRequest = new this.requestModel({
      userEnvia: userSend._id,
      userRecibe: userReceive._id,
      status: Status.Pendiente,
    });

    await this.userModel.updateOne(
      { _id: userSendId },
      {
        $push: {
          'solicitudesAmistad.0.enviadas': {
            _id: friendRequest._id.toString(),
            to: userReceiveId,
            estado: Status.Pendiente,
            fecha: new Date(),
          },
        },
      },
    );

    await this.userModel.updateOne(
      { _id: userReceiveId },
      {
        $push: {
          'solicitudesAmistad.0.recibidas': {
            _id: friendRequest._id.toString(),
            from: userSendId,
            estado: Status.Pendiente,
            fecha: new Date(),
          },
        },
      },
    );

    const savedRequest = await friendRequest.save();

    await this.invalidate([
      `friendreq:received:${userReceiveId}`,
      `friendreq:user:${userSendId}`,
      `friendreq:user:${userReceiveId}`,
      this.buildPairKey(userSendId, userReceiveId),
    ]);

    await this.invalidate([`friendreq:req:${savedRequest._id.toString()}`]);
    return {
      ...savedRequest.toObject(),
      _id: savedRequest._id.toString(),
    };
  }

  async findAllReceiveRequest(userId: string) {
    const exists = await this.usersService.userExists(userId);
    if (!exists) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const cacheKey = `friendreq:received:${userId}`;
    const cached = await this.cacheGet<any[]>(cacheKey);
    if (cached) return cached;

    const requests = await this.requestModel
      .find({
        userRecibe: userId,
        status: Status.Pendiente,
      })
      .populate({
        path: 'userEnvia',
        select: '_id nombre imagen descripcion email',
      })
      .select('_id userEnvia status createdAt')
      .lean()
      .exec();

    const result = requests.map((req) => {
      const sender = req.userEnvia as any;

      return {
        id: req._id.toString(),
        status: req.status,
        sender: {
          id: sender._id ? sender._id.toString() : sender.toString(),
          nombre: sender.nombre || '',
          imagen: sender.imagen || null,
          descripcion: sender.descripcion || '',
          email: sender.email || '',
        },
      };
    });
    this.cacheSet(cacheKey, result, this.TTL_REQUEST_SECONDS);
    return result;
  }

  async findOneReq(requestId: string) {
    const cacheKey = `friendreq:req:${requestId}`;
    const cached = await this.cacheGet<any>(cacheKey);
    if (cached) return cached;

    const req = await this.requestModel
      .findById(requestId)
      .populate('userEnvia', 'nombre imagen email descripcion')
      .populate('userRecibe', 'nombre imagen email descripcion')
      .lean()
      .exec();

    if (req) {
      this.cacheSet(cacheKey, req, this.TTL_REQUEST_SECONDS);
    }
    return req as any;
  }

  async acceptRequest(requestId: string, userId: string) {
    const request = await this.findOneReq(requestId);

    if (!request) throw new HttpException('Request not found', HttpStatus.NOT_FOUND);
    if (request.status == Status.Aceptada) {
      throw new NotFoundException('la solicitud ya fue aceptada');
    }
    if (request.userRecibe._id !== userId)
      throw new HttpException("You're not authorized", HttpStatus.UNAUTHORIZED);
    if (request.status !== Status.Pendiente)
      throw new HttpException('Already processed',HttpStatus.BAD_REQUEST);

    const senderId =
      typeof request.userEnvia === 'object'
        ? request.userEnvia._id.toString()
        : request.userEnvia.toString();

    const receiverId =
      typeof request.userRecibe === 'object'
        ? request.userRecibe._id.toString()
        : request.userRecibe.toString();
    await this.requestModel.updateOne(
      { _id: requestId },
      { $set: { status: Status.Aceptada } },
    );
    const chat = await this.privateChatsService.findExistingChatBetweenUsers(
      userId,
      request.userEnvia._id,
    );
console.log(chat,"NO?")
    if (!chat) {
      await this.privateChatsService.create({
        amistad: requestId,
        lastMessage: '',
      });
    }

    await this.requestModel.updateOne(
      { _id: requestId },
      { $set: { status: Status.Aceptada, chatPrivado: chat.id } },
    );

    const updatedRequest = await this.requestModel.findByIdAndUpdate(
      requestId,
      {
        chatPrivado: chat.id,
      },
      { new: true },
    );

    await this.userModel.updateOne(
      { _id: senderId },
      {
        $set: {
          'solicitudesAmistad.0.enviadas.$[elem].estado': Status.Aceptada,
          'solicitudesAmistad.0.enviadas.$[elem].chatPrivado': chat.id,
        },
      },
      { arrayFilters: [{ 'elem._id': requestId }] },
    );

    await this.userModel.updateOne(
      { _id: receiverId },
      {
        $set: {
          'solicitudesAmistad.0.recibidas.$[elem].estado': Status.Aceptada,
          'solicitudesAmistad.0.recibidas.$[elem].chatPrivado': chat.id,
        },
      },
      { arrayFilters: [{ 'elem._id': requestId }] },
    );

    await this.invalidate([
      `friendreq:req:${requestId}`,
      `friendreq:user:${senderId}`,
      `friendreq:user:${receiverId}`,
      `friendreq:accepted:${senderId}`,
      `friendreq:accepted:${receiverId}`,
      `users:friends:${senderId}`,
      `users:friends:${receiverId}`,
    ]);

    return updatedRequest;
  }

  async deleteRequest(requestId: string, userId: string) {
    const user = await this.usersService.findOneUser(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const friendRequest = await this.findOneReq(requestId);
    if (!friendRequest) {
      throw new HttpException('Friend request not found', HttpStatus.NOT_FOUND);
    }

    const senderId = friendRequest.userEnvia._id.toString();
    const receiverId = friendRequest.userRecibe._id.toString();

    const deleted = await this.requestModel.findByIdAndDelete(requestId);
    if (!deleted) {
      throw new HttpException(
        'The request could not be deleted',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.userModel.updateOne(
      { _id: senderId },
      {
        $pull: {
          'solicitudesAmistad.0.enviadas': { _id: requestId },
        },
      },
    );

    await this.userModel.updateOne(
      { _id: receiverId },
      {
        $pull: {
          'solicitudesAmistad.0.recibidas': { _id: requestId },
        },
      },
    );

    await this.invalidate([
      `friendreq:req:${requestId}`,
      `friendreq:received:${receiverId}`,
      `friendreq:user:${senderId}`,
      `friendreq:user:${receiverId}`,
      this.buildPairKey(senderId, receiverId),
    ]);
    return deleted;
  }

  async findUserRequests(userId: string) {
    const cacheKey = `friendreq:user:${userId}`;
    const cached = await this.cacheGet<FriendRequest[]>(cacheKey);
    if (cached) return cached;

    const list = await this.requestModel
      .find({ $or: [{ userEnvia: userId }, { userRecibe: userId }] })
      .populate('userEnvia', 'nombre imagen')
      .populate('userRecibe', 'nombre imagen')
      .lean()
      .exec();
    this.cacheSet(cacheKey, list, this.TTL_REQUEST_SECONDS);
    return list as any;
  }

  async findAcceptedFriendships(userId: string) {
    const cacheKey = `friendreq:accepted:${userId}`;
    const cached = await this.cacheGet<FriendRequest[]>(cacheKey);
    if (cached) return cached as any;

    const list = await this.requestModel
      .find({
        status: Status.Aceptada,
        $or: [{ userEnvia: userId }, { userRecibe: userId }],
      })
      .populate('userEnvia', 'nombre imagen descripcion')
      .populate('userRecibe', 'nombre imagen descripcion')
      .lean()
      .exec();
    this.cacheSet(cacheKey, list, this.TTL_REQUEST_SECONDS);
    return list as any;
  }

  async findBetweenUsers(loggedUserId: string, otherUserId: string) {
    if (loggedUserId === otherUserId) {
      throw new HttpException(
        'Cannot check friend request with yourself',
        HttpStatus.BAD_REQUEST,
      );
    }

    const request = await this.requestModel.findOne({
      $or: [
        { userEnvia: loggedUserId, userRecibe: otherUserId },
        { userEnvia: otherUserId, userRecibe: loggedUserId },
      ],
    });

    if (!request) {
      return { exists: false, request: null };
    }

    return { exists: true, request };
  }
}
