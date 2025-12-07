import { ApiProperty } from '@nestjs/swagger';

export class ComentarioResponseDto {
  @ApiProperty({
    description: 'ID del comentario',
    example: '64b7f9a2e1d3f2a5b6c7d8ea',
  })
  id: string;

  @ApiProperty({
    description: 'Usuario que hizo el comentario',
    example: {
      _id: '691bf9c02e5f2fe2ab3bd061',
      nombre: 'Felipe',
      imagen: null,
      userId: '691bf9c02e5f2fe2ab3bd061'
    },
  })
  usuario: any;

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
    dto.usuario = model.usuario || null;
    dto.comentario = model.comentario;
    dto.createdAt = model.createdAt;
    return dto;
  }
}
