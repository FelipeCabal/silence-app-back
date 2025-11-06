// src/chats/chats.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RouterModule } from '@nestjs/core';
import {
  Comunidades,
  ComunidadesSchema,
} from './entitesNosql/community.schema';
import { Grupos, GruposSchema } from './entitesNosql/groups.schema';
import {
  InvitacionesGrupos,
  InvitacionesGruposSchema,
} from './entitesNosql/invitations.schema';
import { ChatPrivado, ChatPrivadoSchema } from './entitesNosql/chats.schema';
import { Mensajes, MensajesSchema } from './entities/mensajes.schema';
import { MessagesController } from './messages/messages.controller';
import { PrivateChatsService } from './services/private-chats.service';
import { GroupService } from './groups/groups.service';
import { CommunityService } from './comunity/community.service';
import { MessagesService } from './messages/message.service';
import { MiembrosComunidades, MiembrosComunidadesSchema } from './entitesNosql/miembros-community.schema';
import { ChatPrivateController } from './chat-private/chat-private.controller';
import { GroupChatsController } from './controllers/group-chats.controller';
import { ComunidadesController } from './controllers/comunity-chats.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comunidades.name, schema: ComunidadesSchema },
      { name: Grupos.name, schema: GruposSchema },
      { name: InvitacionesGrupos.name, schema: InvitacionesGruposSchema },
      { name: ChatPrivado.name, schema: ChatPrivadoSchema },
      { name: Mensajes.name, schema: MensajesSchema },
      { name: MiembrosComunidades.name, schema: MiembrosComunidadesSchema },
    ]),
    RouterModule.register([
      {
        path: 'chats',
        module: ChatsModule,
      },
    ]),
  ],
  controllers: [
    ChatPrivateController,
    ComunidadesController,
    GroupChatsController,
    MessagesController,
  ],
  providers: [
    PrivateChatsService,
    GroupService,
    CommunityService,
    MessagesService,
  ],
  exports: [
    PrivateChatsService,
    GroupService,
    CommunityService,
    MessagesService,
  ],
})
export class ChatsModule {}
