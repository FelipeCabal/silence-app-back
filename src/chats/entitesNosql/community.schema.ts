import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comunidades extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop()
  descripcion?: string;

  @Prop()
  imagen?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'MiembrosComunidades' }] })
  miembros: Types.ObjectId[];
}

export const ComunidadesSchema = SchemaFactory.createForClass(Comunidades);
