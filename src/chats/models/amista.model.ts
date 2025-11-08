import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UserSummary } from 'src/users/entities/user.model';

export class AmistadSummary {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;
 @Prop({ type: UserSummary })
  usuario1: UserSummary;

  @Prop({ type: UserSummary })
  usuario2: UserSummary;
}
