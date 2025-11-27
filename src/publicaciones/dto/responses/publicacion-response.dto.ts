import { ApiProperty } from '@nestjs/swagger';
import { Publicacion } from 'src/publicaciones/entities/publicacion.schema';
import { ComentarioResponseDto } from './comentario-reponse.dto';
import { Types } from 'mongoose';
import { User } from 'src/users/entities/user.model';

export class PublicacionResponseDto {
  @ApiProperty({
    description: 'ID de la publicación',
    example: '64b7f8c2e1d3f2a5b6c7d8e9',
  })
  id: string;
  @ApiProperty({
    description: "User who created the post",
    example: '_id: 64b7f8c2e1d3f2a5b6c7d8e9 , nombre: Jhon Doe , imagen: https://example.com/image.jpg'
  })
  owner: User;

  @ApiProperty({
    description: 'Descripción de la publicación',
    example: 'Esta es una publicación de ejemplo.',
  })
  description: string;

  @ApiProperty({
    description: 'URL de la imagen asociada a la publicación',
    example:
      ['https://example.com/image.jpg',
        'https://example.com/image2.jpg'
      ],
    type: [String],
    nullable: true,
  })
  imagen: string[];

  @ApiProperty({
    description: 'Comentarios de la publicación',
    example: [],
  })
  comentarios: ComentarioResponseDto[];

  @ApiProperty({
    description: 'Cantidad de likes en la publicación',
    example: 10,
  })
  cantLikes?: number;

  @ApiProperty({
    description: 'Cantidad de comentarios en la publicación',
    example: 5,
  })
  cantComentarios?: number;

  @ApiProperty({
    description: 'Indica si la publicación es anónima',
    example: false,
  })
  esAnonimo: boolean;

  @ApiProperty({
    description: 'Fecha de creación de la publicación',
    example: '2023-08-30T12:34:56Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Usuarios que dieron like a la publicación',
    example: [],
  })
  likes: Types.ObjectId[];

  @ApiProperty({
    description: 'Fecha de actualización de la publicación',
    example: '2023-08-30T12:34:56Z',
  })
  updatedAt: Date;

  public static fromModel(model: Publicacion): PublicacionResponseDto {
    const dto = new PublicacionResponseDto();
    dto.id = model.id ?? model._id?.toString();
    dto.owner = model.owner
    dto.description = model.description;
    dto.imagen = (model.imagen ?? []);
    dto.comentarios = (model.comentarios ?? []).map((c) =>
      ComentarioResponseDto.fromModel(c),
    );
    dto.cantLikes = model.cantLikes ?? 0;
    dto.cantComentarios = model.cantComentarios ?? 0;
    dto.likes = model.likes ?? [];
    dto.esAnonimo = model.esAnonimo;
    dto.createdAt = model.createdAt;
    dto.updatedAt = model.updatedAt;
    return dto;
  }
}
