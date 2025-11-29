import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from 'src/users/entities/user.model';

export enum NotificationType {
  COMMENT,
  LIKE,
  POST,
}

@Schema({
  timestamps: true,
})
export class NotificationModel extends Document {
  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ required: false })
  sender?: User;

  @Prop({ required: true })
  receiver: User;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  createdAt?: Date;
}

export const NotificationSchema =
  SchemaFactory.createForClass(NotificationModel);
