import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateComentarioDto {
  @IsString()
  @ApiProperty({
    description: 'Contenido del comentario',
    example: '¡Excelente publicación!',
  })
  comentario: string;
}
