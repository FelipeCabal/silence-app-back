import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from 'src/users/entities/user.model';

export class Members {


    @Prop({ type: User, required: true })
    user: User;


  @Prop()
  rol?:string
}
