import { IsString, IsOptional } from 'class-validator';

export class CreateGrupoDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  imagen?: string;
}
