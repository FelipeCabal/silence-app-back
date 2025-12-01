import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReporteUsuarioDto {
  @ApiProperty({ description: 'ID del usuario que está siendo reportado' })
  @IsString()
  userReportadoId: string;

  @ApiProperty({ description: 'Motivo del reporte' })
  @IsString()
  motivo: string;

  @ApiPropertyOptional({ description: 'Descripción adicional del reporte' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
