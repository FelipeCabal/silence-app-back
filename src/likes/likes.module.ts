import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { UsersModule } from 'src/users/users.module';
import { PublicacionesModule } from 'src/publicaciones/publicaciones.module';
import { PublicacionesService } from 'src/publicaciones/services/publicaciones.service';
import { UsersService } from 'src/users/services/users.service';
import { LikesService } from './likes.service';

@Module({
  imports: [UsersModule, PublicacionesModule],
  controllers: [LikesController],
  providers: [PublicacionesService, UsersService, LikesService],
})
export class LikesModule { }
