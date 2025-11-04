import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true })
export class Message extends Document {
@Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
usuarioId: Types.ObjectId;


@Prop({ required: true, trim: true })
message: string;


@Prop({ type: Types.ObjectId, ref: 'Chat', required: true, index: true })
chatId: Types.ObjectId;


@Prop({ required: true, enum: ['private', 'group', 'community'] })
chatType: string;


@Prop({ default: false })
edited: boolean;

}


export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ chatId: 1, createdAt: -1 });