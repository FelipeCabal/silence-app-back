import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MembersSummary } from '../models/member.model';

@Schema({ timestamps: true })
export class Comunidades extends Document {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop()
  descripcion?: string;

  @Prop()
  imagen?: string;

  @Prop({ type: [MembersSummary], default: [] })
  miembrosSummary: MembersSummary[];
}

export const ComunidadesSchema = SchemaFactory.createForClass(Comunidades);
