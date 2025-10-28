import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudesController } from './controllers/solicitudes.controller';
import { SolicitudesAmistadService } from './services/solicitudesAmistad.service';
import { ChatsModule } from 'src/chats/chats.module';
import { MongooseModule } from '@nestjs/mongoose';
import { userModelSchema, userSchema } from './entities/users.schema';
import { FriendRequest, FriendRequestSchema } from './entities/solicitud.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: userSchema.name,
        schema: userModelSchema,
      },
      {
        name: FriendRequest.name,
        schema: FriendRequestSchema
      }
    ]),
    forwardRef(() => ChatsModule),
  ],
  controllers: [UsersController, SolicitudesController],
  providers: [UsersService, SolicitudesAmistadService],
  exports: [TypeOrmModule, SolicitudesAmistadService, UsersService]
})
export class UsersModule { }
