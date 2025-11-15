import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { MessagesService } from '../services/mensajes.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import {
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateMessageDto } from 'src/chats/dto/mensajesDto/create-mensaje.dto';

@Controller('mensajes')
@ApiTags('mensajes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class MensajesController {
  constructor(private readonly mensajesService: MessagesService) { }

  @Post('send')
  @ApiOperation({ summary: 'Enviar mensaje' })
  @ApiBody({ type: CreateMessageDto })
  async sendMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return await this.mensajesService.createMessage(createMessageDto, userId);
  }

  @Get(':chatId/type/:type')
  @ApiOperation({ summary: 'Obtener mensajes por chat' })
  @ApiParam({ name: 'chatId', type: String, description: 'ID del chat' })
  @ApiParam({ name: 'type', type: String, description: 'Tipo de chat (private, group, community)' })
  async findAllMessages(
    @Param('chatId') chatId: string,
    @Param('type') type: string,
  ) {
    return await this.mensajesService.findMessagesByChatId(chatId, type);
  }

  @Delete(':chatId/type/:chatType')
  @ApiOperation({ summary: 'Eliminar mensajes del chat' })
  @ApiParam({ name: 'chatId', type: String, description: 'ID del chat' })
  @ApiParam({ name: 'chatType', type: String, description: 'Tipo de chat (private, group, community)' })
  async clearChat(
    @Param('chatId') chatId: string,
    @Param('chatType') chatType: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return await this.mensajesService.clearChat(chatId, userId, chatType);
  }
}
