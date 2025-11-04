import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { MessagesService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('mensajes')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@Body() dto: CreateMessageDto) {
    return this.messagesService.create(dto);
  }

  @Get('chat/:chatId')
  async findByChat(@Param('chatId') chatId: string) {
    return this.messagesService.findByChat(chatId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body('message') message: string) {
    return this.messagesService.updateMessage(id, message);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.messagesService.delete(id);
  }
}
