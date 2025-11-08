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
} from '@nestjs/common';
import { ChatPrivateService } from './chat-private.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiBody, ApiOperation, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateChatPrivadoDto } from '../request/chat-private.dto';

@Controller('chat-privado')
@ApiTags('private-chats')
@UseGuards(AuthGuard)
export class ChatPrivateController {
  constructor(private readonly chatPrivateService: ChatPrivateService) {}

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
    const userId = req.user.id;
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
  async findById(@Param('id') id: string) {
    const data = await this.chatPrivateService.findById(id);
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
}
