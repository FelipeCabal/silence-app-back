import { Types } from 'mongoose';
import { Status } from 'src/config/enums/status.enum';
import { UserSummaryModel } from './user-summary.model';

export class InvitacionSimpleModel {
  _id: Types.ObjectId;
  user: UserSummaryModel;
  grupoNombre: string;
  status: Status;
  createdAt: Date;

  static fromEntity(entity: any): InvitacionSimpleModel {
    const model = new InvitacionSimpleModel();
    model._id = entity._id;
    model.user = UserSummaryModel.fromSnapshot({
      userId: entity.userId,
      userName: entity.userName,
      imagen: entity.userImage,
    });
    model.grupoNombre = entity.grupoNombre;
    model.status = entity.status;
    model.createdAt = entity.createdAt;
    return model;
  }
}
