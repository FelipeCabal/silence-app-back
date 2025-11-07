import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ChatPrivateService } from './chat-private.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateChatPrivadoDto } from '../request/chat-private.dto';

@Controller('chat-privado')
@ApiTags('private-chats')
//@UseGuards(AuthGuard)
export class ChatPrivateController {
  constructor(private readonly chatPrivateService: ChatPrivateService) {}

  @Post()
  @ApiOperation({ summary: 'Crear chat privado' })
  async create(@Body() dto: CreateChatPrivadoDto) {
    const data = await this.chatPrivateService.create(dto);
    return {
      err: false,
      msg: 'Chat privado creado correctamente',
      data,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar chats privados del usuario' })
  async findAllByUser(
    @Query('userId') userId: string,
  ): Promise<any> {
    const data = await this.chatPrivateService.findAllByUser(userId);
    return {
      err: false,
      msg: 'Chats privados obtenidos correctamente',
      datas: data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener chat privado por ID' })
  async findById(@Param('id') id: string) {
    return this.chatPrivateService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar chat privado' })
  async delete(@Param('id') id: string) {
    return this.chatPrivateService.delete(id);
  }
}
