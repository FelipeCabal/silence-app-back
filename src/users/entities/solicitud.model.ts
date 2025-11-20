import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Status } from 'src/config/enums/status.enum';
import { User } from './user.model';

@Schema({ collection: 'friendRequest', timestamps: true })
export class FriendRequest extends Document {
  @Prop({ type: User, required: true })
  userEnvia: User;

  @Prop({ type: User, required: true })
  userRecibe: User;

  @Prop({
    type: String,
    enum: Object.values(Status),
    default: Status.Pendiente,
  })
  status: Status;

  @Prop({ type: String, ref: 'ChatPrivado', default: null })
  chatPrivado?: string;
}

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);
