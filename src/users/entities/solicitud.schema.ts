import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Status } from 'src/config/enums/status.enum';

@Schema({ collection: 'friendRequest', timestamps: true })
export class FriendRequest extends Document {
    @Prop({ type: Types.ObjectId, ref: 'UserSchema', required: true })
    userEnvia: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'UserSchema', required: true })
    userRecibe: Types.ObjectId;

    @Prop({ type: String, enum: Object.values(Status), default: Status.Pendiente })
    status: Status;

    @Prop({ type: Types.ObjectId, ref: 'ChatPrivado', required: false })
    chatPrivado?: Types.ObjectId;
}

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);
