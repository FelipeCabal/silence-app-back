import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from 'src/config/enums/roles.enum';

@Schema({ timestamps: true })
export class MiembrosComunidades extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Comunidades', required: true })
  comunidad: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  usuario: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(Role),
    default: Role.Member,
  })
  rol: Role;
}

export const MiembrosComunidadesSchema = SchemaFactory.createForClass(MiembrosComunidades);
