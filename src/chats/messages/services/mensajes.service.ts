import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ChatPrivateService } from "src/chats/chat-private/chat-private.service";
import { CommunityService } from "src/chats/comunity/community.service";
import { CreateMessageDto } from "src/chats/dto/mensajesDto/create-mensaje.dto";
import { GroupService } from "src/chats/groups/groups.service";
import { Mensajes } from "src/chats/schemas/mensajes.schema";
import { UsersService } from "src/users/services/users.service";

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Mensajes.name) private mensajeModel: Model<Mensajes>,
    private readonly usersService: UsersService,
    private readonly privateChatsService: ChatPrivateService,
    private readonly groupChatService: GroupService,
    private readonly comunidadesService: CommunityService,
  ) { }

  async createMessage(dto: CreateMessageDto, userId: string) {
    const { message, chatId, chatType } = dto;

    const user = await this.usersService.findOneUser(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const newMessage = await this.mensajeModel.create({
      usuarioId: userId,
      message,
      chatId,
      chatType,
    });

    const msg = newMessage.toObject();
    return {
      id: msg._id.toString(),
      ...msg,
    };
  }

  async findMessagesByChatId(chatId: string, chatType: string) {
    const messages = await this.mensajeModel.find({ chatId, chatType }).lean();

    return messages.map(({ _id, ...rest }) => ({
      id: _id.toString(),
      ...rest,
    }));
  }

  async clearChat(chatId: string, userId: string, chatType: string) {
    if (chatType === 'private') {
      const chat = await this.privateChatsService.findById(chatId);

      const allowed =
        chat.amistad.usuario1._id.toString() === userId ||
        chat.amistad.usuario2._id.toString() === userId;

      if (!allowed)
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (chatType === 'group') {
      const chat = await this.groupChatService.findById(chatId);

      const isMember = chat.members.some(
        (m) => m.user._id.toString() === userId,
      );

      if (!isMember)
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (chatType === 'community') {
      const chat = await this.comunidadesService.findById(chatId);

      const isAllowed = chat.miembros.some(
        (m) =>
          m.user._id.toString() === userId && ['Admin', 'Owner'].includes(m.rol),
      );

      if (!isAllowed)
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const deleted = await this.mensajeModel.deleteMany({ chatId });
    return { deleted: deleted.deletedCount };
  }
}
