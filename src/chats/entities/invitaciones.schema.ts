import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Status } from 'src/config/enums/status.enum';

@Schema({ timestamps: true, collection: 'invitaciones_grupos' })
export class InvitacionesGrupos extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  grupoId: Types.ObjectId;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  grupoNombre: string;

  @Prop({
    type: String,
    enum: Object.values(Status),
    default: Status.Pendiente,
  })
  status: Status;
}

export const InvitacionesGruposSchema = SchemaFactory.createForClass(InvitacionesGrupos);
