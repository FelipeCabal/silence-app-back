import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Members } from '../models/member.model';

@Schema({ timestamps: true, collection: 'chat_privado' })
export class ChatPrivado extends Document {
  @Prop({ type: [Members], default: [] })
  miembros: Members[];

  @Prop({ type: Boolean, default: false })
  isFriends: boolean;

  @Prop()
  lastMessage?: string;

  @Prop({ type: Date, default: () => new Date() })
  lastMessageDate: Date;

  @Prop({
    type: [
      {
        mensaje: { type: String, required: true },
        fecha: { type: Date, default: Date.now },
        remitente: { type: Types.ObjectId, ref: 'User', required: true },
      },
    ],
    default: [],
  })
  mensajes: {
    mensaje: string;
    fecha: Date;
    remitente: Types.ObjectId;
  }[];
}

export const ChatPrivadoSchema = SchemaFactory.createForClass(ChatPrivado);
