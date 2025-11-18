import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateCommunityMessageDto {
  @ApiProperty({ example: 'Hola a todos!', description: 'Contenido del mensaje' })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'El mensaje no puede estar vacío o ser solo espacios' })
  readonly message: string;
}
