import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Status } from 'src/config/enums/status.enum';

@Schema({ timestamps: true })
export class InvitacionesGrupos extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Grupos', required: true })
  grupo: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(Status),
    default: Status.Pendiente,
  })
  status: Status;
}

export const InvitacionesGruposSchema = SchemaFactory.createForClass(InvitacionesGrupos);
