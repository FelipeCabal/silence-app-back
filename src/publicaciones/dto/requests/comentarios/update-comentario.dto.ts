import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateComentarioDto {
  @IsString()
  @ApiProperty({
    description: 'Contenido del comentario',
    example: '¡Excelente publicación!',
  })
  comentario: string;
}
