import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion } from '../entities/publicacion.schema';
import { Comentario } from '../models/comentario.model';
import { CreateComentarioDto } from '../dto/requests/comentarios/create-comentario.dto';
import { UpdateComentarioDto } from '../dto/requests/comentarios/update-comentario.dto';
import { PublicacionResponseDto } from '../dto/responses/publicacion-response.dto';
import { RedisService } from 'src/redis/redis.service';
import { UserSchema } from 'src/users/entities/users.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostEventPayload } from 'src/notifications/listeners/post.listener';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Publicacion.name)
    private publicacionesModel: Model<Publicacion>,
    @InjectModel(UserSchema.name)
    private usersModel: Model<UserSchema>,
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new comment
   * @param data - The data to create a new comment
   * @returns The created comment
   */
  async createComentario(
    publicacionId: string,
    userID: string,
    data: CreateComentarioDto,
  ) {
    const publicacion = await this.publicacionesModel.findById(publicacionId);
    const user = await this.usersModel.findById(userID);

    if (!user) {
      throw new NotFoundException(`Usuario con id ${userID} no encontrado`);
    }

    if (!publicacion)
      throw new NotFoundException(
        `Publicacion con id ${publicacionId} no encontrada`,
      );

    const comentario: Comentario = {
      _id: new Types.ObjectId(),
      usuario: {
        _id: user._id.toString(),
        nombre: user.nombre,
        imagen: user.imagen || null,
        userId: user._id.toString(),
      },
      comentario: data.comentario,
      createdAt: new Date(),
    };

    publicacion.comentarios.push(comentario);
    publicacion.cantComentarios = publicacion.comentarios.length;

    await publicacion.save();
    await this.redisService.client.del(`publicacion:${publicacionId}`);

    await this.usersModel.updateMany(
      {
        'likes._id': publicacionId,
        _id: { $ne: userID },
      },
      {
        $set: {
          'likes.$.cantComentarios': publicacion.cantComentarios,
        },
      },
    );

    const payload: PostEventPayload = {
      post: PublicacionResponseDto.fromModel(publicacion),
      sender: user,
    };

    this.eventEmitter.emit('post.commented', payload);

    return PublicacionResponseDto.fromModel(publicacion);
  }

  /**
   * Update a comment
   * @param comentarioId - The ID of the comment to update
   * @param data - The data to update the comment
   * @returns The updated comment
   */
  async updateComentario(comentarioId: string, data: UpdateComentarioDto) {
    const publicacion = await this.publicacionesModel.findOne({
      comentarios: { $elemMatch: { _id: new Types.ObjectId(comentarioId) } },
    });

    if (!publicacion)
      throw new NotFoundException(
        `No se encontró una publicación para el comentario con id ${comentarioId} no encontrado`,
      );

    const comentario = publicacion.comentarios.find((c) =>
      c._id.equals(comentarioId),
    );

    if (!comentario)
      throw new NotFoundException(
        `Comentario con id ${comentarioId} no encontrado`,
      );

    publicacion.comentarios = publicacion.comentarios.map((c) => {
      if (c._id.equals(comentarioId)) {
        return {
          ...c,
          comentario: data.comentario ?? c.comentario,
        };
      }
      return c;
    });

    await publicacion.save();
    await this.redisService.client.del(
      `publicacion:${publicacion._id.toString()}`,
    );

    return PublicacionResponseDto.fromModel(publicacion);
  }

  /**
   * Delete a comment
   * @param comentarioId - The ID of the comment to delete
   * @returns A confirmation of deletion
   */
  async deleteComentario(comentarioId: string) {
    const publicacion = await this.publicacionesModel.findOne({
      comentarios: { $elemMatch: { _id: new Types.ObjectId(comentarioId) } },
    });

    if (!publicacion)
      throw new NotFoundException(
        `Comentario con id ${comentarioId} no encontrado`,
      );

    publicacion.comentarios = publicacion.comentarios.filter(
      (c) => !c._id.equals(comentarioId),
    );
    publicacion.cantComentarios = publicacion.comentarios.length;

    await publicacion.save();
    await this.redisService.client.del(
      `publicacion:${publicacion._id.toString()}`,
    );

   await this.usersModel.updateMany(
    {
      'likes._id': publicacion._id.toString(),
    },
    {
      $set: {
        'likes.$.cantComentarios': publicacion.cantComentarios,
      },
    },
  );
    return { deleted: true };
  }
}
