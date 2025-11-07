import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from 'src/users/services/users.service';
import { Role } from 'src/config/enums/roles.enum';
import { Mensajes } from 'src/chats/schemas/mensajes.schema';
import { ChatPrivateService } from 'src/chats/chat-private/chat-private.service';
import { GroupService } from 'src/chats/groups/groups.service';
import { CommunityService } from 'src/chats/comunity/community.service';
import { CreateMessageDto } from 'src/chats/dto/mensajesDto/create-mensaje.dto';

@Injectable()
export class MessagesService {
    constructor(
        @InjectModel(Mensajes.name) private mensajeModel: Model<Mensajes>,
        private readonly usersService: UsersService, // Inyectamos el servicio de usuarios
        private readonly privateChatsService: ChatPrivateService,
        private readonly groupChatService: GroupService,
        private readonly comunidadesService: CommunityService
    ) { }

    // Crear un nuevo mensaje y asociarlo al usuario
    async createMessage(createMessageDto: CreateMessageDto): Promise<Partial<Mensajes>> {
        const { message, chatId, chatType, usuarioId } = createMessageDto;

        // Verificar si el usuario existe
        const user = await this.usersService.findOneUser(usuarioId); // Usamos el usuarioId que llega en el request
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Crear el mensaje
        const newMessage = await new this.mensajeModel({
            usuarioId,
            message,
            chatId,
            chatType,
        }).save();

        const { _id, createdAt, updatedAt } = newMessage.toObject();
        return {
            id: _id.toString(), usuarioId, message, chatId, chatType, createdAt, updatedAt
        };
    }

    // Obtener mensajes por chatId y chatType
    async findMessagesByChatId(chatId: number, chatType: string): Promise<Partial<Mensajes>[]> {
        const messages = await this.mensajeModel
            .find({ chatId, chatType })
            .lean()
            .exec();

        if (!messages.length) {
            throw new NotFoundException('No messages found for this chat.');
        }

        return messages.map(({ _id, usuarioId, message, chatId, chatType, createdAt, updatedAt }) => ({
            id: _id.toString(),
            usuarioId,
            message,
            chatId,
            chatType,
            createdAt,
            updatedAt,
        }));
    }

    async ClearChat(chatId: number, userId: String, ChatType: string) {

        //  if (ChatType === 'private') {
        //      const chat = await this.privateChatsService.findOne(chatId);
        //
        //      if (chat.amistad.userEnvia.id.toString() !== userId && chat.amistad.userRecibe.id.toString() !== userId) {
        //          throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        //      }
        //
        //      const deletedMessages = await this.mensajeModel.deleteMany({ chatId });
        //
        //      return { deletedCount: deletedMessages.deletedCount };
        //
        //  } else if (ChatType === 'group') {
        //      const chat = await this.groupChatService.findGroupById(chatId);
        //
        //      const isMember = chat.miembros.some((member) => member.id === userId);
        //      if (!isMember) {
        //          throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
        //      }
        //
        //      const deletedMessages = await this.mensajeModel.deleteMany({ chatId });
        //
        //      return { deletedCount: deletedMessages.deletedCount }
        //
        //  } else if (ChatType === 'community') {
        //      const chat = await this.comunidadesService.findCommunityById(chatId);
        //
        //      const isOwner = chat.miembros.some((member) => member.rol === Role.Owner && member.id.toString() === userId);
        //      const isAdmin = chat.miembros.some((member) => member.rol === Role.Admin && member.id.toString() === userId);
        //
        //      if (!isOwner && !isAdmin) {
        //          throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        //      }
        //
        //      const deletedMessages = await this.mensajeModel.deleteMany({ chatId });
        //
        //      return { deletedCount: deletedMessages.deletedCount }
        //  } else {
        //      throw new HttpException('No tienes permiso para eliminar mensajes en este chat', HttpStatus.UNAUTHORIZED);
        //
        //  }

    }
}
