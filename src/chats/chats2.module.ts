import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Mensajes, MensajesSchema } from './entities/mensajes.schema';
import { InvitacionesGrupos, InvitacionesGruposSchema } from './entities/invitaciones.schema';
/* import { ChatPrivado, ChatPrivadoSchema } from './entities/chatPrivado.schema'; */
import { ChatPrivado, Comunidades, Grupos } from './entities/chats.entity';
/* import { Comunidades, ComunidadesSchema } from './entities/comunidades.schema'; */
/* import { MiembrosComunidades, MiembrosComunidadesSchema } from './entities/miembrosComunidad.schema'; */
import { MiembrosComunidades } from './entities/miembrosComunidad.entity';

import { PrivateChatsService } from './services/private-chats.service';
import { UsersModule } from 'src/users/users.module';
import { PrivateChatsController } from './controllers/private-chats.controller';

import { RouterModule } from '@nestjs/core';
import { GroupInvitationsService } from './services/group-invitations.service2';
import { GroupChatsService } from './services/gruop-chats.service';
import { InvitationsGroupController } from './controllers/group-invitations2.controoller';
import { GroupChatsController } from './controllers/group-chats.controller';
import { ComunidadesService } from './services/comunity-chats.service';
import { ComunidadesController } from './controllers/comunity-chats.controller';
import { MessagesService } from './services/mensajes.service';
import { MensajesController } from './controllers/mensajes.controller';
import { MessagesGateway } from './gateway/chats.gateway';
import { GroupInvitationsModule } from './module/GroupInvitationsModule';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatPrivado.name, schema: ChatPrivadoSchema },
      { name: Grupos.name, schema: GruposSchema },
      { name: Comunidades.name, schema: ComunidadesSchema },
      { name: MiembrosComunidades.name, schema: MiembrosComunidadesSchema },
      { name: Mensajes.name, schema: MensajesSchema },
    ]),
    forwardRef(() => UsersModule),
    GroupInvitationsModule,
    RouterModule.register([
      {
        path: 'chats',
        module: ChatsModule,
      },
    ]),
  ],
  controllers: [
    PrivateChatsController,
    GroupChatsController,
    ComunidadesController,
    MensajesController,
  ],
  providers: [
    PrivateChatsService,
    GroupChatsService,
    ComunidadesService,
    MessagesService,
    MessagesGateway,
  ],
  exports: [
    MongooseModule,
    PrivateChatsService,
  ],
})
export class ChatsModule {}
