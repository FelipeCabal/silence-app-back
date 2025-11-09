import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Status } from 'src/config/enums/status.enum';
import { Group } from '../models/groups.model';
import { UserSummary } from 'src/users/entities/user.model';

@Schema({ timestamps: true })
export class InvitacionesGrupos extends Document {

    @Prop({ type: UserSummary, required: true })
    usuarioSummary: UserSummary;

    @Prop({ type: Group, required: true })
    group: Group;


  @Prop({
    type: String,
    enum: Object.values(Status),
    default: Status.Pendiente,
  })
  status: Status;
}

export const InvitacionesGruposSchema = SchemaFactory.createForClass(InvitacionesGrupos);
