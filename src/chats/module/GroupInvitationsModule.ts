import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from 'src/users/users.module';
import { InvitationsGroupController } from '../controllers/group-invitations.controller';
import { GroupInvitationsService } from '../messages/services/group-invitations.service2';
import {
  InvitacionesGrupos,
  InvitacionesGruposSchema,
} from '../schemas/invitations.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InvitacionesGrupos.name, schema: InvitacionesGruposSchema },
    ]),
    forwardRef(() => UsersModule),
    /*     forwardRef(() => GroupChatsModule), */
  ],
  controllers: [InvitationsGroupController],
  providers: [GroupInvitationsService],
  exports: [GroupInvitationsService],
})
export class GroupInvitationsModule {}
