import { Publicacion } from 'src/publicaciones/entities/publicacion.schema';

export class PublicacionResponseDto {
  id: string;
  description: string;
  imagen: string | null;
  comentarios: any[];
  cantLikes?: number;
  cantComentarios?: number;
  esAnonimo: boolean;
  createdAt: Date;
  updatedAt: Date;

  public static fromModel(model: Publicacion): PublicacionResponseDto {
    const dto = new PublicacionResponseDto();
    dto.id = model.id ?? model._id?.toString();
    dto.description = model.description;
    dto.imagen = model.imagen ?? null;
    dto.comentarios = model.comentarios ?? [];
    dto.cantLikes = model.cantLikes ?? 0;
    dto.cantComentarios = model.cantComentarios ?? 0;
    dto.esAnonimo = model.esAnonimo;
    dto.createdAt = model.createdAt
    dto.updatedAt = model.updatedAt;
    return dto;
  }
}
