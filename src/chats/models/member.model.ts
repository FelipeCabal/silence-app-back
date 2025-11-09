import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export class Members {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop()
  nombre: string;

  @Prop()
  avatar?: string;

  @Prop()
  rol?:string
}
