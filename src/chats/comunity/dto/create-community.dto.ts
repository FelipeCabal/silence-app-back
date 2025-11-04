import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateComunidadDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  imagen?: string;
}
