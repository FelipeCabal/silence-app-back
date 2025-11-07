import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AmistadSummary } from '../models/amista.model';

@Schema({ timestamps: true, collection: 'chat_privado' })
export class ChatPrivado extends Document {
  @Prop({ type: AmistadSummary, required: true })
  amistadSummary: AmistadSummary;

  @Prop()
  lastMessage?: string;
}

export const ChatPrivadoSchema = SchemaFactory.createForClass(ChatPrivado);
