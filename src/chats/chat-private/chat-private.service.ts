import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatPrivado } from '../schemas/chats.schema';
import { ChatPrivadoResponseDto } from '../response/chat-private.response';
import { CreateChatPrivadoDto } from '../request/chat-private.dto';
import { FriendRequest } from 'src/users/entities/solicitud.model';
import { Status } from 'src/config/enums/status.enum';
import { RedisService } from 'src/redis/redis.service';
import { Role } from 'src/config/enums/roles.enum';

@Injectable()
export class ChatPrivateService {
  constructor(
    @InjectModel(ChatPrivado.name)
    private readonly chatPrivadoModel: Model<ChatPrivado>,

    @InjectModel(FriendRequest.name)
    private readonly friendRequestModel: Model<FriendRequest>,

    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateChatPrivadoDto): Promise<ChatPrivadoResponseDto> {
    try {
      const friendship = await this.friendRequestModel
        .findOne({
          _id: dto.amistad,
          status: Status.Aceptada,
        })
        .populate(['userEnvia', 'userRecibe'])
        .lean();

      if (!friendship) {
        throw new NotFoundException(
          'La solicitud de amistad no existe o no ha sido aceptada.',
        );
      }

      const miembro1 = {
        user: {
          _id: friendship.userEnvia._id,
          nombre: friendship.userEnvia.nombre,
          imagen: friendship.userEnvia.imagen ?? null,
        },
        rol: Role.Owner,
      };

      const miembro2 = {
        user: {
          _id: friendship.userRecibe._id,
          nombre: friendship.userRecibe.nombre,
          imagen: friendship.userRecibe.imagen ?? null,
        },
        rol: Role.Owner,
      };

      const existingChat = await this.chatPrivadoModel.findOne({
        $and: [
          { 'miembros.user._id': { $all: [miembro1.user._id, miembro2.user._id] } },
        ],
      });

      if (existingChat) {
        throw new ConflictException('El chat privado ya existe.');
      }

      const mensajes =
        dto.lastMessage && miembro1.user._id
          ? [
              {
                mensaje: dto.lastMessage,
                remitente: miembro1.user._id,
              },
            ]
          : [];

      const chat = await this.chatPrivadoModel.create({
        miembros: [miembro1, miembro2],
        mensajes,
        lastMessage: dto.lastMessage ?? '',
        lastMessageDate: new Date(),
        isFriends: true, 
      });

      await this.redisService.client.del(`private-chats:${miembro1.user._id}`);
      await this.redisService.client.del(`private-chats:${miembro2.user._id}`);

      return ChatPrivadoResponseDto.fromModel(chat.toObject());
    } catch (err) {
      console.error('Error en ChatPrivadoService.create():', err);
      throw new InternalServerErrorException('Error al crear chat privado.');
    }
  }

  async findById(id: string, userId: string): Promise<ChatPrivadoResponseDto> {
    const chat = await this.chatPrivadoModel.findById(id).lean();
    if (!chat) throw new NotFoundException('Chat no encontrado');

    const isParticipant = chat.miembros.some(
      (m) => m.user._id.toString() === userId,
    );

    if (!isParticipant) {
      throw new ForbiddenException('No tienes acceso a este chat');
    }

    // Find the other user (not the logged user) - handle both string and ObjectId
    const otherUser = chat.miembros.find(
      (m: any) => {
        const memberId = m.user._id.toString ? m.user._id.toString() : m.user._id;
        return memberId !== userId;
      }
    )?.user;

    return ChatPrivadoResponseDto.fromModel(chat, otherUser);
  }

  async findAllByUser(userId: string): Promise<ChatPrivadoResponseDto[]> {
    const cacheKey = `private-chats:${userId}`;

    try {
      const cachedChats = await this.redisService.client.get(cacheKey);
      if (cachedChats) return JSON.parse(cachedChats);
    } catch (err) {
      console.warn('Redis no disponible:', err.message);
    }

    const userObjectId = new Types.ObjectId(userId);

    const chats = await this.chatPrivadoModel
      .find({ 'miembros.user._id': userObjectId })
      .sort({ updatedAt: -1 })
      .lean();

    const chatDtos = chats.map((chat) => {
      // Find the other user (not the logged user) - handle both string and ObjectId
      const otherUser = chat.miembros.find(
        (m: any) => {
          const memberId = m.user._id.toString ? m.user._id.toString() : m.user._id;
          return memberId !== userId;
        }
      )?.user;

      return ChatPrivadoResponseDto.fromModel(chat, otherUser);
    });

    try {
      await this.redisService.client.set(cacheKey, JSON.stringify(chatDtos), 'EX', 3600);
    } catch (err) {
      console.warn('Error guardando en Redis:', err.message);
    }

    return chatDtos;
  }

  async addMessage(
    chatId: string,
    remitenteId: string,
    mensaje: string,
  ): Promise<ChatPrivadoResponseDto> {
    const chat = await this.chatPrivadoModel.findById(chatId);
    if (!chat) throw new NotFoundException('Chat no encontrado');

    const isParticipant = chat.miembros.some(
      (m) => m.user._id.toString() === remitenteId,
    );

    if (!isParticipant) {
      throw new ForbiddenException('No puedes enviar mensajes en este chat');
    }

    chat.mensajes.push({
      mensaje,
      fecha: new Date(),
      remitente: new Types.ObjectId(remitenteId),
    });

    chat.lastMessage = mensaje;
     chat.lastMessageDate = new Date();
    await chat.save();

    await this.redisService.client.del(`private-chat:${chatId}`);

    return ChatPrivadoResponseDto.fromModel(chat.toObject());
  }

  async updateLastMessage(
    chatId: string,
    userId: string,
    message: string,
  ): Promise<ChatPrivadoResponseDto> {
    try {
      const chat = await this.chatPrivadoModel.findOne({
        _id: chatId,
        'miembros.user._id': new Types.ObjectId(userId),
      });

      if (!chat) throw new NotFoundException('Chat no encontrado o acceso denegado.');

      if (chat.mensajes.length > 0) {
        const lastIndex = chat.mensajes.length - 1;
        chat.mensajes[lastIndex].mensaje = message;
        chat.mensajes[lastIndex].remitente = new Types.ObjectId(userId);
        chat.mensajes[lastIndex].fecha = new Date();
      } else {
        chat.mensajes = [
          {
            mensaje: message,
            remitente: new Types.ObjectId(userId),
            fecha: new Date(),
          },
        ];
      }

      chat.lastMessage = message;
      chat.lastMessageDate = new Date();
      const updatedChat = await chat.save();

      for (const miembro of updatedChat.miembros) {
        if (miembro?.user?._id) {
          await this.redisService.client.del(`private-chats:${miembro.user._id}`);
        }
      }

      return ChatPrivadoResponseDto.fromModel(updatedChat.toObject());
    } catch (err) {
      console.error('Error en updateLastMessage:', err);
      throw new InternalServerErrorException('No se pudo actualizar el último mensaje.');
    }
  }

  async delete(id: string): Promise<{ deleted: true }> {
    const deleted = await this.chatPrivadoModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Chat no encontrado');

    await this.redisService.client.del(`private-chat:${id}`);
    return { deleted: true };
  }


 async findExistingChatBetweenUsers(
  userA: string,
  userB: string,
): Promise<ChatPrivadoResponseDto | null> {
  if (!Types.ObjectId.isValid(userA) || !Types.ObjectId.isValid(userB)) {
    throw new BadRequestException('Invalid user IDs.');
  }

  const userAObjectId = new Types.ObjectId(userA);
  const userBObjectId = new Types.ObjectId(userB);

  const existingChat = await this.chatPrivadoModel
    .findOne({
      'miembros.user._id': { $all: [userAObjectId, userBObjectId] },
    })
    .lean();

  if (!existingChat) return null;

  return ChatPrivadoResponseDto.fromModel(existingChat);
}

}
