import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Grupos extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop()
  descripcion?: string;

  @Prop()
  imagen?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  miembros: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'InvitacionesGrupos' }] })
  invitaciones: Types.ObjectId[];
}

export const GruposSchema = SchemaFactory.createForClass(Grupos);
