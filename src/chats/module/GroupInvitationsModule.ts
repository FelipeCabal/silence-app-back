import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitacionesGrupos, InvitacionesGruposSchema } from '../entities/invitaciones.schema';
import { GroupInvitationsService } from '../services/group-invitations.service2';
import { InvitationsGroupController } from '../controllers/group-invitations2.controoller';
import { UsersModule } from 'src/users/users.module';
import { GroupChatsModule } from './group-chats.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InvitacionesGrupos.name, schema: InvitacionesGruposSchema },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => GroupChatsModule),
  ],
  controllers: [InvitationsGroupController],
  providers: [GroupInvitationsService],
  exports: [GroupInvitationsService],
})
export class GroupInvitationsModule {}
