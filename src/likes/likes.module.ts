/* import { Module } from '@nestjs/common';
//import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { UsersModule } from 'src/users/users.module';
import { PublicacionesModule } from 'src/publicaciones/publicaciones.module';
//import { TypeOrmModule } from '@nestjs/typeorm';
//import { Like } from './like.entity';
import { PublicacionesService } from 'src/publicaciones/services/publicaciones.service';
import { UsersService } from 'src/users/services/users.service';

//quite TypeOrmModule.forFeature([Like]), para evitar errrores con postgrsql
@Module({
  imports: [ UsersModule, PublicacionesModule],
  controllers: [LikesController],
  providers: [ PublicacionesService, UsersService],
})
export class LikesModule {} */
