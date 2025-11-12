import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { SolicitudesController } from './controllers/solicitudes.controller';
import { SolicitudesAmistadService } from './services/solicitudesAmistad.service';
import { MongooseModule } from '@nestjs/mongoose';
import { userModelSchema, UserSchema } from './entities/users.schema';
import { FriendRequest, FriendRequestSchema } from './entities/solicitud.schema';
import { ChatsModule } from 'src/chats/chats.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserSchema.name,
        schema: userModelSchema,
      },
      {
        name: FriendRequest.name,
        schema: FriendRequestSchema
      }
    ]),
    forwardRef(() => ChatsModule),
    RedisModule
  ],
  controllers: [UsersController, SolicitudesController],
  providers: [UsersService, SolicitudesAmistadService],
  exports: [MongooseModule, SolicitudesAmistadService, UsersService]
})
export class UsersModule { }
