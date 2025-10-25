import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from './entities/publicacion.schema';
import { ComentarioResponseDto } from './comentarios/dto/responses/comentario-response.dto';

@Injectable()
export class ComentariosApplicationService {
  constructor(
    @InjectModel(Publicacion.name)
    private publicacionesModel: Model<Publicacion>,
  ) {}

  /**
   * Create a new comment on the given post
   * @param comentario Comment to add
   * @param postId ID of the post to add the comment to
   * @returns
   */
  async createComentarioOnPost(
    comentario: ComentarioResponseDto,
    postId: string,
  ) {
    const publicacion = await this.publicacionesModel.findById(postId).exec();
    if (!publicacion) return;

    publicacion.comentarios = publicacion.comentarios || [];
    publicacion.comentarios.push(comentario);
    publicacion.cantComentarios = publicacion.comentarios.length;

    await publicacion.save();
  }

  /**
   *
   * @param comentario
   * @param postId
   * @returns
   */
  async updateComentarioOnPost(
    comentario: ComentarioResponseDto,
    comentarioId: string,
    postId: string,
  ) {
    const publicacion = await this.publicacionesModel.findById(postId).exec();
    if (!publicacion) return;

    publicacion.comentarios = publicacion.comentarios.map((c) =>
      c.id === comentarioId ? comentario : c,
    );

    await publicacion.save();
  }

  /**
   *
   * @param comentario
   * @param postId
   * @returns
   */
  async deleteComentarioOnPost(comentarioId: string, postId: string) {
    const publicacion = await this.publicacionesModel.findById(postId).exec();
    if (!publicacion) return;

    publicacion.comentarios = publicacion.comentarios.filter(
      (c) => c.id !== comentarioId,
    );
    publicacion.cantComentarios = publicacion.comentarios.length;

    await publicacion.save();
  }
}
