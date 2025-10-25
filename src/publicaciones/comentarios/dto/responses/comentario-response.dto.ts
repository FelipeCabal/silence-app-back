import { ApiProperty } from '@nestjs/swagger';
import { Comentario } from '../../entities/comentarios.schema';

export class ComentarioResponseDto {
  @ApiProperty({
    description: 'ID del comentario',
    example: '64e4b9a1c2a3f9b1d2e4c5a7',
  })
  id: string;

  @ApiProperty({
    description: 'ID de la publicación asociada',
    example: '64e4b8f5c2a3f9b1d2e4c5a6',
  })
  publicacionId?: string;

  @ApiProperty({
    description: 'Contenido del comentario',
    example: '¡Excelente publicación!',
  })
  comentario: string;

  @ApiProperty({
    description: 'Fecha de creación del comentario',
    example: '2023-08-30T12:34:56Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de actualización del comentario',
    example: '2023-08-30T12:34:56Z',
  })
  updatedAt: Date;

  public static fromModel(model: Comentario): ComentarioResponseDto {
    const dto = new ComentarioResponseDto();

    dto.id = model.id ?? model._id?.toString();
    dto.publicacionId = model.publicacion.toString();
    dto.comentario = model.comentario;
    dto.createdAt = model.createdAt;
    dto.updatedAt = model.updatedAt;
    return dto;
  }
}
