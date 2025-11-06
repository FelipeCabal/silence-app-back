import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export class CommunitySummary {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop()
  nombre: string;

  @Prop()
  imagen?: string;
}
