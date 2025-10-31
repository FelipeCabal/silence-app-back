import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export class Comentario {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  usuario: Types.ObjectId | null;

  @Prop({ required: true, trim: true })
  comentario: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}
