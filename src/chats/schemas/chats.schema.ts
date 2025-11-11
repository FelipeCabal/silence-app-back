import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Amistad } from '../models/amista.model';

@Schema({ timestamps: true, collection: 'chat_privado' })
export class ChatPrivado extends Document {
  @Prop({ type: Amistad, required: true })
  amistad: Amistad;

  @Prop()
  lastMessage?: string;
}

export const ChatPrivadoSchema = SchemaFactory.createForClass(ChatPrivado);
