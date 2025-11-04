import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGrupoDto {
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
