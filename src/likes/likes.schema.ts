import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false, timestamps: { createdAt: true, updatedAt: false } })
export class LikeUsuario extends Document {
    @Prop({ type: String, required: true })
    postId: string;
}

export const LikeUsuarioSchema = SchemaFactory.createForClass(LikeUsuario);
