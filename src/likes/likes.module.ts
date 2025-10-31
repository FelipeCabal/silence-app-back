import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { UsersModule } from 'src/users/users.module';
import { PublicacionesModule } from 'src/publicaciones/publicaciones.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './like.entity';
import { Publicaciones } from 'src/publicaciones/entities/publicaciones.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Publicaciones, User]), UsersModule, PublicacionesModule],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule { }
