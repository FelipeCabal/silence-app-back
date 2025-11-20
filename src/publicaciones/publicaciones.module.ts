import { Module } from '@nestjs/common';
import { PublicacionesController } from './controllers/publicaciones.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/services/users.service';
import { Publicacion, PublicacionSchema } from './entities/publicacion.schema';
import { PublicacionesService } from './services/publicaciones.service';
import { ComentariosController } from './controllers/comentarios.controller';
import { ComentariosService } from './services/comentarios.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Publicacion.name,
        schema: PublicacionSchema,
      },
    ]),
    UsersModule,
    RedisModule,
  ],
  controllers: [ComentariosController, PublicacionesController],
  providers: [ComentariosService, PublicacionesService, UsersService],
  exports: [MongooseModule, UsersModule, PublicacionesService],
})
export class PublicacionesModule {}
