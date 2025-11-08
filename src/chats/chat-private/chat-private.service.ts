import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatPrivado } from '../schemas/chats.schema';
import { ChatPrivadoResponseDto } from '../response/chat-private.response';
import { CreateChatPrivadoDto } from '../request/chat-private.dto';
import { FriendRequest } from 'src/users/entities/solicitud.model';
import { Status } from 'src/config/enums/status.enum';

@Injectable()
export class ChatPrivateService {
  constructor(
    @InjectModel(ChatPrivado.name)
    private readonly chatPrivadoModel: Model<ChatPrivado>,

    @InjectModel(FriendRequest.name)
    private readonly friendRequestModel: Model<FriendRequest>,
  ) {}

  async create(dto: CreateChatPrivadoDto): Promise<ChatPrivadoResponseDto> {
    try {
      console.log(dto, 'e');
      const friendship = await this.friendRequestModel
        .findOne({
          _id: dto.amistad,
          status: Status.Aceptada,
        })
        .lean();
      console.log(friendship, 'bro?');

      if (!friendship) {
        throw new NotFoundException(
          'La solicitud de amistad no existe o no ha sido aceptada.',
        );
      }
      const usuario1 = {
        _id: friendship.userEnvia,
        nombre: friendship.userEnvia.nombre,
      };

      const usuario2 = {
        _id: friendship.userRecibe,
        nombre: friendship.userRecibe.nombre,
      };

      console.log(usuario1, 'hola', usuario2);

      const exists = await this.chatPrivadoModel.findOne({
        $or: [
          {
            'amistadSummary.usuario1._id': usuario1._id,
            'amistadSummary.usuario2._id': usuario2._id,
          },
          {
            'amistadSummary.usuario1._id': usuario2._id,
            'amistadSummary.usuario2._id': usuario1._id,
          },
        ],
      });
      if (exists) {
        throw new ConflictException('El chat privado ya existe.');
      }

      const chat = await this.chatPrivadoModel.create({
        amistadSummary: {
          _id: friendship._id,
          usuario1,
          usuario2,
        },
        lastMessage: dto.lastMessage ?? null,
      });

      return ChatPrivadoResponseDto.fromModel(chat.toObject());
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Error al crear chat privado.');
    }
  }

  async findById(id: string): Promise<ChatPrivadoResponseDto> {
    const chat = await this.chatPrivadoModel.findById(id).lean();
    if (!chat) throw new NotFoundException('Chat no encontrado');

    return ChatPrivadoResponseDto.fromModel(chat);
  }

  async findAllByUser(userId: string): Promise<ChatPrivadoResponseDto[]> {
    const chats = await this.chatPrivadoModel
      .find({
        $or: [
          { 'amistadSummary.usuario1': new Types.ObjectId(userId) },
          { 'amistadSummary.usuario2': new Types.ObjectId(userId) },
        ],
      })
      .sort({ updatedAt: -1 })
      .lean();

    return chats.map((chat) => ChatPrivadoResponseDto.fromModel(chat));
  }

  async updateLastMessage(id: string, message: string) {
    const chat = await this.chatPrivadoModel
      .findByIdAndUpdate(
        id,
        { lastMessage: message, updatedAt: new Date() },
        { new: true },
      )
      .lean();

    if (!chat) throw new NotFoundException('Chat no encontrado');

    return ChatPrivadoResponseDto.fromModel(chat);
  }

  async delete(id: string): Promise<{ deleted: true }> {
    const deleted = await this.chatPrivadoModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Chat no encontrado');

    return { deleted: true };
  }
}
