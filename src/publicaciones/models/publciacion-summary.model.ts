import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Publicacion } from '../entities/publicacion.schema';

export class PublicacionModel {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ default: null, trim: true })
  imagen: string | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  usuario: Types.ObjectId | null;

  @Prop({ default: false })
  esAnonimo: boolean;

  @Prop({ default: 0 })
  cantComentarios?: number;

  @Prop({ default: 0 })
  cantLikes?: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  public static fromModel(model: Publicacion): PublicacionModel {
    const dto = new PublicacionModel();
    dto._id = model.id ?? model._id?.toString();
    dto.description = model.description;
    dto.imagen = model.imagen ?? null;
    dto.cantLikes = model.cantLikes ?? 0;
    dto.cantComentarios = model.cantComentarios ?? 0;
    dto.esAnonimo = model.esAnonimo;
    dto.createdAt = model.createdAt;

    return dto;
  }
}
