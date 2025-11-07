import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export class AmistadSummary {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  usuario1: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  usuario2: Types.ObjectId;
}
