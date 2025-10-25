import { forwardRef, Module } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { ComentariosController } from './comentarios.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ComentarioSchema, Comentario } from './entities/comentarios.schema';
import { PublicacionesModule } from '../publicaciones.module';
import { PublicacionesController } from '../publicaciones.controller';
import { UsersModule } from 'src/users/users.module';
import { UsersController } from 'src/users/controllers/users.controller';
import { UsersService } from 'src/users/services/users.service';
import { ComentariosApplicationService } from '../comentarios-application.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Comentario.name,
        schema: ComentarioSchema,
      },
    ]),
    PublicacionesModule,
    UsersModule,
  ],
  controllers: [
    ComentariosController,
    PublicacionesController,
    UsersController,
  ],
  providers: [ComentariosService, UsersService, ComentariosApplicationService],
  exports: [ComentariosService],
})
export class ComentariosModule {}
