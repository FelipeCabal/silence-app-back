import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Request,
  Req,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { ChatPrivateService } from './chat-private.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

import { ApiBody, ApiOperation, ApiTags, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CreateChatPrivadoDto } from '../request/chat-private.dto';
import { CreateMessageDto } from '../dto/mensajesDto/create-mensaje.dto';
import { ChatPrivadoResponseDto } from '../response/chat-private.response';

@Controller('chat-privado')
@ApiTags('private-chats')

@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ChatPrivateController {
  constructor(private readonly chatPrivateService: ChatPrivateService) { }

  @Post()
  @ApiOperation({ summary: 'Crear chat privado entre dos usuarios' })
  @ApiBody({ type: CreateChatPrivadoDto })
  async create(@Body() dto: CreateChatPrivadoDto) {
    const data = await this.chatPrivateService.create(dto);
    return {
      err: false,
      msg: 'Chat privado creado correctamente',
      data,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar chats privados del usuario autenticado' })
  async findAllByUser( @Request() req: any) {

    const userId = req.user._id;
    const data = await this.chatPrivateService.findAllByUser(userId);
    return {
      err: false,
      msg: 'Chats privados obtenidos correctamente',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener chat privado por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID del chat privado' })
  async findById(@Param('id') id: string,@Req() req:any) {
    const userId= req.user._id
    const data = await this.chatPrivateService.findById(id,userId);
    return {
      err: false,
      msg: 'Chat privado obtenido correctamente',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar chat privado' })
  @ApiParam({ name: 'id', type: String, description: 'ID del chat privado' })
  async delete(@Param('id') id: string) {
    const data = await this.chatPrivateService.delete(id);
    return {
      err: false,
      msg: 'Chat privado eliminado correctamente',
      data,
    };
  }

  @Post(':id/message')
@ApiOperation({ summary: 'Agregar un mensaje al chat privado' })
@ApiParam({ name: 'id', type: String, description: 'ID del chat privado' })
@ApiBody({ type: CreateMessageDto })
async addMessage(
  @Param('id') id: string,
  @Body() dto: CreateMessageDto,
  @Req() req: any,
) {
  const userId = req.user._id;
  const data = await this.chatPrivateService.addMessage(id,userId,dto.message);
  return {
    err: false,
    msg: 'Mensaje agregado correctamente',
    data,
  };
}
  @Patch(':id/last-message')
  @ApiOperation({ summary: 'Actualizar el último mensaje de un chat privado (usuario autenticado)' })
  async updateLastMessage(
    @Param('id') chatId: string,
    @Body('message') message: string,
    @Request() req: any,
  ): Promise<{ err: boolean; msg: string; data?: ChatPrivadoResponseDto }> {
    const userId = req.user._id;

    if (!message || message.trim() === '') {
      throw new BadRequestException('El mensaje no puede estar vacío.');
    }

    const updatedChat = await this.chatPrivateService.updateLastMessage(chatId, userId, message);

    return {
      err: false,
      msg: 'Último mensaje actualizado correctamente.',
      data: updatedChat,
    };
  }

}
