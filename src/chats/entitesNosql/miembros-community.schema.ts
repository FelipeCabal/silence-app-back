import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from 'src/config/enums/roles.enum';
import { CommunitySummary, UserSummary } from '../models/all.summary';

@Schema({ timestamps: true })
export class MiembrosComunidades extends Document {

  @Prop({ type: UserSummary, required: true })
  usuarioSummary: UserSummary;

  @Prop({
    type: String,
    enum: Object.values(Role),
    default: Role.Member,
  })
  rol: Role;
}

export const MiembrosComunidadesSchema = SchemaFactory.createForClass(MiembrosComunidades);
