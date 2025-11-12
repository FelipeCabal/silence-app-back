import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
//import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudesController } from './controllers/solicitudes.controller';
import { SolicitudesAmistadService } from './services/solicitudesAmistad.service';
import { MongooseModule } from '@nestjs/mongoose';
import { userModelSchema, UserSchema } from './entities/users.schema';
import { FriendRequest, FriendRequestSchema } from './entities/solicitud.schema';
import { User } from './entities/user.entity';
import { ChatsModule } from 'src/chats/chats.module';
<<<<<<< HEAD

@Module({
  imports: [//TypeOrmModule.forFeature([User]),
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
  ],
  controllers: [UsersController, SolicitudesController],
  providers: [UsersService, SolicitudesAmistadService],
  exports: [ MongooseModule, SolicitudesAmistadService, UsersService]
=======
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [//TypeOrmModule.forFeature([User]),
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
>>>>>>> 8b6e6c55cf90235b595a691e6d1681f8be32cc61
})
export class UsersModule { }
