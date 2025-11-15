import { ApiProperty } from '@nestjs/swagger';

export class ComentarioResponseDto {
  @ApiProperty({
    description: 'ID del comentario',
    example: '64b7f9a2e1d3f2a5b6c7d8ea',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario que hizo el comentario',
    example: '64b7f9a2e1d3f2a5b6c7d8eb',
  })
  usuario: string | null;

  @ApiProperty({
    description: 'Contenido del comentario',
    example: 'Este es un comentario de ejemplo.',
  })
  comentario: string;

  @ApiProperty({
    description: 'Fecha de creación del comentario',
    example: '2023-08-30T12:34:56Z',
  })
  createdAt: Date;

  public static fromModel(model: any): ComentarioResponseDto {
    const dto = new ComentarioResponseDto();
    dto.id = model._id?.toString();
    dto.usuario = model.usuario ? model.usuario.toString() : null;
    dto.comentario = model.comentario;
    dto.createdAt = model.createdAt;
    return dto;
  }
}
