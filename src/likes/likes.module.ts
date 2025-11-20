import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { UsersModule } from 'src/users/users.module';
import { PublicacionesModule } from 'src/publicaciones/publicaciones.module';
import { PublicacionesService } from 'src/publicaciones/services/publicaciones.service';
import { UsersService } from 'src/users/services/users.service';
import { LikesService } from './likes.service';
import { RedisModule } from 'src/redis/redis.module';

//quite TypeOrmModule.forFeature([Like]), para evitar errrores con postgrsql
@Module({
  imports: [UsersModule, PublicacionesModule, RedisModule],
  controllers: [LikesController],
  providers: [PublicacionesService, UsersService, LikesService],
})
export class LikesModule {}
