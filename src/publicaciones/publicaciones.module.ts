import { Module } from '@nestjs/common';
import { PublicacionesController } from './publicaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publicaciones } from './entities/publicaciones.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { comentarioModelSchema, ComentariosSchema } from './comentarios/entities/comentarios.schema';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/services/users.service';
import { Publicacion, PublicacionSchema } from './entities/publicacion.schema';
import { PublicacionesService } from './publicaciones.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([Publicaciones]),
    MongooseModule.forFeature([
      {
        name: ComentariosSchema.name,
        schema: comentarioModelSchema
      },
      {
        name: Publicacion.name,
        schema: PublicacionSchema
      }
    ]),
    UsersModule,
  ],
  controllers: [PublicacionesController],
  providers: [PublicacionesService, PublicacionesService, UsersService],
  exports: [TypeOrmModule, MongooseModule, UsersModule, PublicacionesService, PublicacionesService]
})
export class PublicacionesModule { }
