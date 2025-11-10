import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from 'src/users/entities/user.model';

export class Amistad {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;
 @Prop({ type: User })
  usuario1: User;

  @Prop({ type: User })
  usuario2: User;
}
