import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateReporteComunidadDto {
  @ApiProperty({ description: 'ID de la comunidad que se está reportando' })
  @IsString()
  comunidadId: string;

  @ApiProperty({ description: 'ID del usuario que está haciendo el reporte' })
  @IsString()
  remitenteId: string;

  @ApiProperty({ description: 'Motivo del reporte' })
  @IsString()
  motivo: string;

  @ApiPropertyOptional({ description: 'Descripción adicional del reporte' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
