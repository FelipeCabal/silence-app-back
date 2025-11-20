import { IsOptional, IsString } from 'class-validator';

export class CreateReporteUsuarioDto {
  @IsString()
  userReportadoId: string;
  @IsString()
  motivo: string;
  @IsOptional()
  @IsString()
  descripcion?: string;
}
