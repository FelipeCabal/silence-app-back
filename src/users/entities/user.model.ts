import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export class User {
  @Prop({ type: String })
  _id: string;

  @Prop()
  nombre: string;

  @Prop()
  imagen?: string;

  @Prop({ type: String })
  userId?: string;
}
