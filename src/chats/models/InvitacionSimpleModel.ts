import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Status } from 'src/config/enums/status.enum';

export class InvitacionSimpleModel {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop()
  userName: string;

  @Prop()
  grupoNombre: string;

  @Prop({ enum: Object.values(Status), default: Status.Pendiente })
  status: Status;

  @Prop({ default: Date.now })
  createdAt: Date;

  static fromEntity(entity: any): InvitacionSimpleModel {
    const model = new InvitacionSimpleModel();
    model._id = entity._id;
    model.userName = entity.userName;
    model.grupoNombre = entity.grupoNombre;
    model.status = entity.status;
    model.createdAt = entity.createdAt;
    return model;
  }
}

