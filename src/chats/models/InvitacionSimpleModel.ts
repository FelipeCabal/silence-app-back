import { Types } from 'mongoose';
import { Status } from 'src/config/enums/status.enum';
import { User } from 'src/users/entities/user.model';
import { Group } from './groups.model';

export class InvitacionSimpleModel {
  _id: Types.ObjectId;
  user: User;
  group: Group;
  status: Status;
  createdAt: Date;

  static fromEntity(entity: any): InvitacionSimpleModel {
    const model = new InvitacionSimpleModel();

    model._id = entity._id;
    model.user = entity.user;
    model.group = entity.group;
    model.status = entity.status;
    model.createdAt = entity.createdAt;

    return model;
  }
}
