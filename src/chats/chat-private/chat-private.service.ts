import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatPrivado } from '../entitesNosql/chats.schema';
import { CreateChatPrivadoDto } from './dto/create-chat-private.dto';
import { ComunityAndGroupQueries } from '../dto/queries/comunities-queries.dto';
import { SolicitudAmistades } from 'src/users/schames/solicitud.schema';
import { User } from 'src/users/schames/user.schema';
import { ObjectId } from 'typeorm';

@Injectable()
export class ChatPrivateService {
  constructor(
    @InjectModel(ChatPrivado.name)
    private readonly chatPrivadoModel: Model<ChatPrivado>,
    @InjectModel(User.name)
    private readonly UserModel: Model<User>,
    @InjectModel(SolicitudAmistades.name)
    private readonly solicitudAmistades: Model<SolicitudAmistades>,
  ) {}

  async create(dto: CreateChatPrivadoDto): Promise<ChatPrivado> {
    try{
        const solicitud = await this.findOneReqMongo(dto.amistad);
        if(!solicitud){
          throw new NotFoundException({
            err:false,
            msg:`SolicitudAmistad con ID ${dto.amistad} no encontrada.`
          })
        }
        const newChat =  new this.chatPrivadoModel(dto);
        return newChat.save();
    }catch(e){
      throw new  InternalServerErrorException('error al crear chat privado')
    }
  
  }

  async findById(id: string): Promise<ChatPrivado> {
    const chat = await this.chatPrivadoModel
      .findById(id)
      .populate({ path: 'amistad', select: 'userEnvia userRecibe status' });
    if (!chat) throw new NotFoundException('Chat no encontrado');
    return chat;
  }

  //PASAR ESTA FUNCION AL SERVICIO SOLICITD DE AMISTAD
      async findOneReqMongo(requestId:string){
        const firendRequest = await this.solicitudAmistades
        .find({_id :requestId})
        .populate({
          path: 'userEnvia'
        })
        .populate({
          path: 'userRecibe'
        }).exec();

        return firendRequest
    }

    /////////////////

  //PASAR EST ECODIGO A USER DESPUES..
  async findAllFriends(userId: string): Promise<any> {
    const friendsList =
      await this.solicitudAmistades.aggregate<SolicitudAmistades>([
        {
          $match: {
            status: 'A',
            $or: [{ userRecibe: userId }, { userEnvia: userId }],
          },
        },
        {
          $lookup: {
            from: 'Users',
            localField: 'userEnvia',
            foreignField: '_id',
            as: 'userEnvia',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userRecibe',
            foreignField: '_id',
            as: 'userRecibe',
          },
        },
        { $unwind: '$userEnvia' },
        { $unwind: '$userRecibe' },
        {
          $addFields: {
            amigo: {
              $cond: {
                if: { $eq: ['$userEnvia._id', new Types.ObjectId(userId)] },
                then: '$userRecibe',
                else: '$userEnvia',
              },
            },
          },
        },
        {
          $project: {
            solicitudId: '$$ROOT',
            user: '$amigo',
            _id: 0,
          },
        },
      ]);
    console.log(friendsList);
    return friendsList;
  }

  ////

  async findAll(
    chatQueries: ComunityAndGroupQueries,
    userId: string,
  ): Promise<ChatPrivado[]> {
    //TODO ---- HACER VERIFICACIÓN DE USER Y CHAT PRIVADOS
    const friendships = await this.findAllFriends(userId);
    if (!friendships || friendships.length === 0) {
      throw new NotFoundException({
        err: true,
        msg: 'no tiene amigos con chat privados',
      });
    }
    const friendshipIds = friendships.map(
      (f) => new ObjectId(f.solicitudId._id),
    );
    let privateChats = await this.chatPrivadoModel.aggregate([
      {
        $match: { amistad: { $in: friendshipIds } },
      },
      {
        $lookup: {
          from: 'solicitudamistades',
          localField: 'amistad',
          foreignField: '_id',
          as: 'amistad',
        },
      },
      { $unwind: '$amistad' },
      {
        $lookup: {
          from: 'users',
          localField: 'amistad.userEnvia',
          foreignField: '_id',
          as: 'amistad.userEnvia',
        },
      },
      { $unwind: '$amistad.userEnvia' },
      {
        $lookup: {
          from: 'users',
          localField: 'amistad.userRecibe',
          foreignField: '_id',
          as: 'amistad.userRecibe',
        },
      },
      { $unwind: '$amistad.userRecibe' },
      {
        $addFields: {
          friend: {
            $cond: {
              if: {
                $eq: ['$amistad.userEnvia._id', new Types.ObjectId(userId)],
              },
              then: '$amistad.userRecibe',
              else: '$amistad.userEnvia',
            },
          },
        },
      },
      {
        $project: {
          id: '$_id',
          createdAt: '$createdAt',
          friend: 1,
          friendName: '$friend.nombre',
        },
      },
    ]);

    if (chatQueries.search) {
      const search = chatQueries.search.toLowerCase();
      privateChats = privateChats.filter((chat) =>
        chat.friendName.toLowerCase().includes(search),
      );
    }

    privateChats.sort((a, b) => a.friendName.localeCompare(b.friendName));

    if (chatQueries.limit && Number.isInteger(chatQueries.limit)) {
      privateChats = privateChats.slice(0, chatQueries.limit);
    }

    if (privateChats.length === 0) {
      throw new NotFoundException({
        err: true,
        msg: 'No se encontraron chats privados para este usuario.',
      });
    }

    return privateChats;
  }

  async delete(id: string): Promise<void> {
    const result = await this.chatPrivadoModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Chat no encontrado');
  }
}
