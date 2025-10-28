import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export class PublicacionModel {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  usuario: Types.ObjectId | null;

  @Prop({ default: false })
  esAnonimo: boolean;

  @Prop({ default: 0 })
  cantComentarios?: number;

  @Prop({ default: 0 })
  cantLikes?: number;

  @Prop({ default: Date.now })
  createdAt: Date;
}
