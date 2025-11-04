import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'createAt' } })
export class ChatPrivado extends Document {
  @Prop({ type: Types.ObjectId, ref: 'SolicitudAmistad', required: true , unique:true })
  amistad: Types.ObjectId;
}

export const ChatPrivadoSchema = SchemaFactory.createForClass(ChatPrivado);
