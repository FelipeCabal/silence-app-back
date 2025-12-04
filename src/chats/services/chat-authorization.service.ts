import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatPrivateService } from '../chat-private/chat-private.service';
import { GroupService } from '../groups/groups.service';
import { CommunityService } from '../comunity/community.service';
import { ChatType } from '../dto/message.dto';
import { ChatPrivado } from '../schemas/chats.schema';
import { Grupos } from '../schemas/groups.schema';
import { Comunidades } from '../schemas/community.schema';

@Injectable()
export class ChatAuthorizationService {
  constructor(
    @InjectModel(ChatPrivado.name)
    private readonly chatPrivadoModel: Model<ChatPrivado>,
    @InjectModel(Grupos.name)
    private readonly gruposModel: Model<Grupos>,
    @InjectModel(Comunidades.name)
    private readonly comunidadesModel: Model<Comunidades>,
    private readonly chatPrivateService: ChatPrivateService,
    private readonly groupService: GroupService,
    private readonly communityService: CommunityService,
  ) {}

  /**
   * Verifica si un usuario tiene acceso a un chat específico
   */
  async verifyAccess(chatId: string, userId: string, chatType: ChatType): Promise<void> {
    switch (chatType) {
      case ChatType.PRIVATE:
        await this.verifyPrivateChatAccess(chatId, userId);
        break;
      case ChatType.GROUP:
        await this.verifyGroupAccess(chatId, userId);
        break;
      case ChatType.COMMUNITY:
        await this.verifyCommunityAccess(chatId, userId);
        break;
      default:
        throw new ForbiddenException('Tipo de chat no válido');
    }
  }

  private async verifyPrivateChatAccess(chatId: string, userId: string): Promise<void> {
    const chat = await this.chatPrivadoModel.findById(chatId).lean();
    
    if (!chat) {
      throw new NotFoundException('Chat privado no encontrado');
    }

    const isParticipant = chat.miembros.some(
      (m) => m.user._id.toString() === userId,
    );

    if (!isParticipant) {
      throw new ForbiddenException('No tienes acceso a este chat privado');
    }
  }

  private async verifyGroupAccess(chatId: string, userId: string): Promise<void> {
    const group = await this.gruposModel.findById(chatId).lean();
    
    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    const isMember = group.members?.some(
      (member) => member.user._id.toString() === userId,
    );

    if (!isMember) {
      throw new ForbiddenException('No eres miembro de este grupo');
    }
  }

  private async verifyCommunityAccess(chatId: string, userId: string): Promise<void> {
    const community = await this.comunidadesModel.findById(chatId).lean();
    
    if (!community) {
      throw new NotFoundException('Comunidad no encontrada');
    }

    const isMember = community.miembros?.some(
      (miembro) => miembro.user._id.toString() === userId,
    );

    if (!isMember) {
      throw new ForbiddenException('No eres miembro de esta comunidad');
    }
  }

  /**
   * Obtiene los IDs de todos los participantes de un chat
   */
  async getChatParticipants(chatId: string, chatType: ChatType): Promise<string[]> {
    switch (chatType) {
      case ChatType.PRIVATE:
        return this.getPrivateChatParticipants(chatId);
      case ChatType.GROUP:
        return this.getGroupParticipants(chatId);
      case ChatType.COMMUNITY:
        return this.getCommunityParticipants(chatId);
      default:
        return [];
    }
  }

  private async getPrivateChatParticipants(chatId: string): Promise<string[]> {
    const chat = await this.chatPrivadoModel.findById(chatId).lean();
    if (!chat) throw new NotFoundException('Chat privado no encontrado');
    return chat.miembros.map((m) => m.user._id.toString());
  }

  private async getGroupParticipants(chatId: string): Promise<string[]> {
    const group = await this.gruposModel.findById(chatId).lean();
    if (!group) throw new NotFoundException('Grupo no encontrado');
    return group.members?.map((member) => member.user._id.toString()) || [];
  }

  private async getCommunityParticipants(chatId: string): Promise<string[]> {
    const community = await this.comunidadesModel.findById(chatId).lean();
    if (!community) throw new NotFoundException('Comunidad no encontrada');
    return community.miembros?.map((miembro) => miembro.user._id.toString()) || [];
  }
}
