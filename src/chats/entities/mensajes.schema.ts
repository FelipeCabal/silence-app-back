import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Mensajes extends Document {
    @Prop({ required: true })
    usuarioId: string;

    @Prop({ required: true, trim: true })
    message: string;

    @Prop({ required: true })
    chatId: number;

    @Prop({ required: true })
    chatType: string; // Tipo de chat: 'private', 'group', 'community'

    createdAt: Date;
    updatedAt: Date;
}

export const MensajesSchema = SchemaFactory.createForClass(Mensajes);
