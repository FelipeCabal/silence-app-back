import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comentario } from './entities/comentarios.schema';
import { Model } from 'mongoose';
import { CreateComentarioDto } from './dto/requests/create-comentario.dto';
import { ComentarioResponseDto } from './dto/responses/comentario-response.dto';
import { UpdateComentarioDto } from './dto/requests/update-comentario.dto';
import { ComentariosApplicationService } from '../comentarios-application.service';
import { PublicacionesService } from '../publicaciones.service';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name) private comentariosModel: Model<Comentario>,
    private readonly publicacionesService: PublicacionesService,
    private readonly comentariosApplicationService: ComentariosApplicationService,
  ) {}

  /**
   * Create a new comment
   * @param data - The data to create a new comment
   * @returns The created comment
   */
  async createComentario(
    publicacionId: string,
    data: CreateComentarioDto,
  ): Promise<ComentarioResponseDto> {
    const publicacion = await this.publicacionesService.findOne(publicacionId);

    if (!publicacion) return null;

    const comentario = await this.comentariosModel.create({
      ...data,
      publicacion: publicacionId,
    });

    const response = ComentarioResponseDto.fromModel(comentario);

    await this.comentariosApplicationService.createComentarioOnPost(
      response,
      publicacionId,
    );

    return response;
  }

  /**
   * Update a comment by its ID
   * @param commentId - The ID of the comment
   * @param data - The data to update the comment
   * @returns The updated comment, or null if not found
   */
  async updateComentario(
    commentId: string,
    data: UpdateComentarioDto,
  ): Promise<ComentarioResponseDto | null> {
    const comentario = await this.comentariosModel
      .findByIdAndUpdate(commentId, data, { new: true })
      .exec();

    if (!comentario) return null;

    const response = ComentarioResponseDto.fromModel(comentario);

    await this.comentariosApplicationService.updateComentarioOnPost(
      response,
      commentId,
      comentario.publicacion.toString(),
    );

    return response;
  }

  /**
   * Delete a comment by its ID
   * @param commentId - The ID of the comment
   * @returns The deleted comment, or null if not found
   */
  async deleteComentario(
    commentId: string,
  ): Promise<ComentarioResponseDto | null> {
    const comentario = await this.comentariosModel
      .findByIdAndDelete(commentId)
      .exec();

    if (!comentario) return null;

    await this.comentariosApplicationService.deleteComentarioOnPost(
      commentId,
      comentario.publicacion.toString(),
    );

    return ComentarioResponseDto.fromModel(comentario);
  }
}
