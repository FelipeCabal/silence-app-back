import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from 'src/users/entities/user.model';

export class Comentario {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: User, default: null })
  usuario: User | null;

  @Prop({ required: true, trim: true })
  comentario: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}
