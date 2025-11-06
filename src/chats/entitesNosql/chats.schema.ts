import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AmistadSummary } from '../models/all.summary';

@Schema({ timestamps: { createdAt: 'createAt' } })
export class ChatPrivado extends Document {
  @Prop({ type: AmistadSummary, required: true })
  amistadSummary: AmistadSummary;

  @Prop()
  lastMessage?: string;
}

export const ChatPrivadoSchema = SchemaFactory.createForClass(ChatPrivado);
