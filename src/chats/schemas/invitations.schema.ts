import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Status } from 'src/config/enums/status.enum';
import { GroupSummary } from '../models/groups.model';
import { UserSummary } from 'src/users/entities/user.model';

@Schema({ timestamps: true })
export class InvitacionesGrupos extends Document {

    @Prop({ type: UserSummary, required: true })
    usuarioSummary: UserSummary;

    @Prop({ type: GroupSummary, required: true })
    groupSummary: GroupSummary;


  @Prop({
    type: String,
    enum: Object.values(Status),
    default: Status.Pendiente,
  })
  status: Status;
}

export const InvitacionesGruposSchema = SchemaFactory.createForClass(InvitacionesGrupos);
