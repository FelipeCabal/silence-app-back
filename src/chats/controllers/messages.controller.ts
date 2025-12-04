import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ChatPrivateService } from '../chat-private/chat-private.service';
import { GroupService } from '../groups/groups.service';
import { CommunityService } from '../comunity/community.service';
import { ChatType } from '../dto/message.dto';
import { ChatPrivado } from '../schemas/chats.schema';
import { Grupos } from '../schemas/groups.schema';
import { Comunidades } from '../schemas/community.schema';

@Controller('chats')
@UseGuards(AuthGuard)
export class MessagesController {
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
   * Obtener mensajes de un chat
   * GET /chats/messages/:chatId?chatType=private&limit=50&offset=0
   */
  @Get(':chatId')
  async getMessages(
    @Param('chatId') chatId: string,
    @Query('chatType') chatType: ChatType,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Request() req?: any,
  ) {
    const userId = req.user._id.toString();

    switch (chatType) {
      case ChatType.PRIVATE: {
        // Verificar acceso primero
        await this.chatPrivateService.findById(chatId, userId);
        
        // Ahora obtener los mensajes directamente del modelo
        const privateChat = await this.chatPrivadoModel.findById(chatId).lean();
        if (!privateChat) throw new NotFoundException('Chat privado no encontrado');
        
        const mensajes = privateChat.mensajes || [];
        const start = offset || 0;
        const end = limit ? start + limit : undefined;
        
        return {
          chatId,
          chatType,
          messages: mensajes.slice(start, end),
          total: mensajes.length,
        };
      }

      case ChatType.GROUP: {
        // Verificar acceso primero
        await this.groupService.findById(chatId, userId);
        
        // Ahora obtener los mensajes directamente del modelo
        const group = await this.gruposModel.findById(chatId).lean();
        if (!group) throw new NotFoundException('Grupo no encontrado');
        
        const mensajes = group.mensajes || [];
        const start = offset || 0;
        const end = limit ? start + limit : undefined;
        
        return {
          chatId,
          chatType,
          messages: mensajes.slice(start, end),
          total: mensajes.length,
        };
      }

      case ChatType.COMMUNITY: {
        // Verificar acceso primero
        await this.communityService.findById(chatId, userId);
        
        // Ahora obtener los mensajes directamente del modelo
        const community = await this.comunidadesModel.findById(chatId).lean();
        if (!community) throw new NotFoundException('Comunidad no encontrada');
        
        const mensajes = community.mensajes || [];
        const start = offset || 0;
        const end = limit ? start + limit : undefined;
        
        return {
          chatId,
          chatType,
          messages: mensajes.slice(start, end),
          total: mensajes.length,
        };
      }

      default:
        return {
          chatId,
          chatType,
          messages: [],
          total: 0,
        };
    }
  }
}
