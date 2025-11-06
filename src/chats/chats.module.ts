import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatPrivado, Comunidades, Grupos } from './entities/chats.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { Mensajes, MensajesSchema } from './entities/mensajes.schema';
import { InvitacionesGrupos } from './entities/invitaciones.entity'; 

import { PrivateChatsService } from './services/private-chats.service';
import { UsersModule } from 'src/users/users.module';
import { PrivateChatsController } from './controllers/private-chats.controller';
import { RouterModule } from '@nestjs/core';
 import { GroupInvitationsService } from './services/group-invitations.service'; 
import { GroupChatsService } from './services/gruop-chats.service';
import { InvitationsGroupController } from './controllers/group-invitations.controller'; 
import { GroupChatsController } from './controllers/group-chats.controller';
import { ComunidadesService } from './services/comunity-chats.service';
import { ComunidadesController } from './controllers/comunity-chats.controller';
import { MiembrosComunidades } from './entities/miembrosComunidad.entity';
import { MessagesService } from './services/mensajes.service';
import { MensajesController } from './controllers/mensajes.controller';
import { MessagesGateway } from './gateway/chats.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatPrivado, Grupos, Comunidades, InvitacionesGrupos, MiembrosComunidades]),
    MongooseModule.forFeature([{ name: Mensajes.name, schema: MensajesSchema }]),
    forwardRef(() => UsersModule),
    RouterModule.register([
      {
        path: 'chats',
        module: ChatsModule
      },
    ]),
  ],
  controllers: [PrivateChatsController, InvitationsGroupController, GroupChatsController, ComunidadesController, MensajesController],
  providers: [PrivateChatsService, GroupInvitationsService, GroupChatsService, ComunidadesService, MessagesService, MessagesGateway],
  exports: [TypeOrmModule, MongooseModule, PrivateChatsService]
})
export class ChatsModule { }
