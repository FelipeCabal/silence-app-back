import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from 'src/config/enums/roles.enum';
import { User } from '../../users/entities/user.model';

@Schema({ timestamps: true })
export class MiembrosComunidades extends Document {
  @Prop({ type: User, required: true })
  user: User;

  @Prop({
    type: String,
    enum: Object.values(Role),
    default: Role.Member,
  })
  rol: Role;
}

export const MiembrosComunidadesSchema =
  SchemaFactory.createForClass(MiembrosComunidades);
