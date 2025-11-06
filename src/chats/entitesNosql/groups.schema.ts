import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MembersSummary } from '../models/member.model';

@Schema({ timestamps: true })
export class Grupos extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop()
  descripcion?: string;

  @Prop()
  imagen?: string;

  @Prop({ type: MembersSummary, required: true })
  membersSummary: MembersSummary;
}

export const GruposSchema = SchemaFactory.createForClass(Grupos);
