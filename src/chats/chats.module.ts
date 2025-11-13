// src/chats/chats.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RouterModule } from '@nestjs/core';
import { Comunidades, ComunidadesSchema } from './schemas/community.schema';
import { Grupos, GruposSchema } from './schemas/groups.schema';
import {
  InvitacionesGrupos,
  InvitacionesGruposSchema,
} from './schemas/invitations.schema';
import { ChatPrivado, ChatPrivadoSchema } from './schemas/chats.schema';
import { Mensajes, MensajesSchema } from './schemas/mensajes.schema';
import { GroupService } from './groups/groups.service';
import { CommunityService } from './comunity/community.service';
import {
  MiembrosComunidades,
  MiembrosComunidadesSchema,
} from './schemas/miembros-community.schema';
import { ChatPrivateController } from './chat-private/chat-private.controller';
import { ComunidadesController } from './comunity/comunity.controller';
import { GroupsController } from './groups/groups.controller';
import { ChatPrivateService } from './chat-private/chat-private.service';
import { FriendRequestSchema } from 'src/users/entities/solicitud.model';
import { FriendRequest } from 'src/users/entities/solicitud.schema';
import { UsersModule } from 'src/users/users.module';
import { InvitationsGroupController } from './messages/controllers/group-invitations2.controller';
import { GroupInvitationsService } from './messages/services/group-invitations.service2';

import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    MongooseModule.forFeature([
      { name: Comunidades.name, schema: ComunidadesSchema },
      { name: Grupos.name, schema: GruposSchema },
      { name: InvitacionesGrupos.name, schema: InvitacionesGruposSchema },
      { name: ChatPrivado.name, schema: ChatPrivadoSchema },
      { name: Mensajes.name, schema: MensajesSchema },
      { name: MiembrosComunidades.name, schema: MiembrosComunidadesSchema },
      { name: FriendRequest.name, schema: FriendRequestSchema },
    ]),
    RedisModule,
  ],
  controllers: [
    ChatPrivateController,
    ComunidadesController,
    GroupsController,
    InvitationsGroupController,
  ],
  providers: [
    ChatPrivateService,
    GroupService,
    CommunityService,
    GroupInvitationsService,
  ],
  exports: [
    ChatPrivateService,
    GroupService,
    CommunityService,
  ],
})
export class ChatsModule {}
