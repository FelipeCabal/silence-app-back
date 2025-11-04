import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../entitesNosql/messages.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
  ) {}

  async create(dto: CreateMessageDto): Promise<Message> {
    const message = new this.messageModel(dto);
    return message.save();
  }

  async findByChat(chatId: string): Promise<Message[]> {
    return this.messageModel
      .find({ chatId })
      .sort({ createdAt: -1 })
      .populate('usuarioId');
  }

  async updateMessage(id: string, content: string): Promise<Message> {
    const message = await this.messageModel.findByIdAndUpdate(
      id,
      { message: content, edited: true },
      { new: true },
    );
    if (!message) throw new NotFoundException('Mensaje no encontrado.');
    return message;
  }

  async delete(id: string): Promise<void> {
    const result = await this.messageModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Mensaje no encontrado.');
  }
}
