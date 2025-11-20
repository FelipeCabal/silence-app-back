import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateComunidadDto {
  @IsString()
  @ApiProperty()
  nombre: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  descripcion?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  imagen?: string;
}
