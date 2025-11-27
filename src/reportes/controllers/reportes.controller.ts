import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Request,
  UseGuards,
  Req,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';

import { ReportesService } from '../services/reportes.service';
import { CreateReporteComunidadDto } from '../dtos/create-reporte-comunidad.dto';
import { CreateReporteUsuarioDto } from '../dtos/create-reporte-usuario.dto';
import {
  TypeEnumReport,
  UpdateEstadoReporteDto,
} from '../dtos/update-reporte.dto';

@Controller('reportes')
@ApiTags('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Post('usuario')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un reporte sobre un usuario' })
  @ApiBody({ type: CreateReporteUsuarioDto })
  async crearReporteUsuario(
    @Body() dto: CreateReporteUsuarioDto,
    @Req() req: any,
  ) {
    const reportadoPorId = req.user._id;
    const data = await this.reportesService.crearReporteUsuario(
      dto,
      reportadoPorId,
    );

    return {
      err: false,
      msg: 'Reporte sobre usuario creado correctamente',
      data,
    };
  }

  @Post('comunidad')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un reporte sobre una comunidad' })
  @ApiBody({ type: CreateReporteComunidadDto })
  async crearReporteComunidad(
    @Body() dto: CreateReporteComunidadDto,
    @Req() req: any,
  ) {
    const reportadoPorId = req.user._id;
    const data = await this.reportesService.crearReporteComunidad(
      dto,
      reportadoPorId,
    );

    return {
      err: false,
      msg: 'Reporte sobre comunidad creado correctamente',
      data,
    };
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID del reporte' })
  @ApiOperation({ summary: 'Obtener reporte por ID' })
  async obtenerPorId(@Param('id') id: string) {
    return this.reportesService.obtenerReportePorId(id);
  }

  @Get()
  @ApiQuery({ name: 'type', enum: TypeEnumReport, required: false })
  @ApiOperation({ summary: 'Listar reportes filtrando por tipo' })
  async obtenerReportes(@Query('type') type?: TypeEnumReport) {
    return this.reportesService.obtenerReportesPorTipo(type);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'ID del reporte' })
  @ApiOperation({ summary: 'Eliminar reporte por ID' })
  async eliminarReporte(@Param('id') id: string) {
    return this.reportesService.eliminarReporte(id);
  }
}
