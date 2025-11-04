import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Status } from 'src/config/enums/status.enum';

@Schema({ collection: 'solicitudAmistad', timestamps: { createdAt: 'fecha', updatedAt: false } })
export class SolicitudAmistades extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userEnvia: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userRecibe: Types.ObjectId;

  @Prop({ type: String, enum: Status, default: Status.Pendiente ,index:true})
  status: Status;

  @Prop({ type: Types.ObjectId, ref: 'ChatPrivado' })
  chatPrivado: Types.ObjectId;
}

export const SolicitudAmistadSchema = SchemaFactory.createForClass(SolicitudAmistades);
