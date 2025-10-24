import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudAmistad } from './entities/solicitud.entity';
import { SolicitudesController } from './controllers/solicitudes.controller';
import { SolicitudesAmistadService } from './services/solicitudesAmistad.service';
import { ChatsModule } from 'src/chats/chats.module';
import { MongooseModule } from '@nestjs/mongoose';
import { userModelSchema, userSchema } from './userSchema/users.schema';

@Module({
  imports: [MongooseModule.forFeature([
    {
      name: userSchema.name,
      schema: userModelSchema
    }
  ]),
  forwardRef(() => ChatsModule),
  ],
  controllers: [UsersController, SolicitudesController],
  providers: [UsersService, SolicitudesAmistadService],
  exports: [TypeOrmModule, SolicitudesAmistadService, UsersService]
})
export class UsersModule { }
