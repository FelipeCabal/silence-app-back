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
  ApiResponse,
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

  @ApiResponse({
    status: 201,
    description: 'Reporte sobre usuario creado correctamente',
    schema: {
      example: {
        err: false,
        msg: 'Reporte sobre usuario creado correctamente',
        data: {
          type: 'USUARIO',
          motivo: 'prueba3',
          descripcion: 'verificando funcionamiento3',
          reporterId: '691bf9c02e5f2fe2ab3bd061',
          reportedId: '691d2224287400929562996',
          _id: '6927a8246f5e80e75897e1fd',
          createdAt: '2025-11-27T01:23:48.128Z',
          updatedAt: '2025-11-27T01:23:48.128Z',
          __v: 0,
        },
      },
    },
  })
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

  @ApiResponse({
    status: 201,
    description: 'Reporte sobre comunidad creado correctamente',
    schema: {
      example: {
        err: false,
        msg: 'Reporte sobre comunidad creado correctamente',
        data: {
          type: 'COMUNIDAD',
          motivo: 'prueba4',
          descripcion: 'verificando funcionamiento4',
          reporterId: '691bf9c02e5f2fe2ab3bd061',
          reportedId: '691c0aa17b21eb32451b386f',
          _id: '6927ad494769eb01c9cc49b6',
          createdAt: '2025-11-27T01:45:45.388Z',
          updatedAt: '2025-11-27T01:45:45.388Z',
          __v: 0,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos en el cuerpo de la solicitud',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - token faltante o inválido',
  })
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

  @ApiResponse({
    status: 200,
    description: 'Reporte encontrado por ID',
    schema: {
      example: {
        _id: '691e7be79b2b15a661b69bed',
        type: 'USUARIO',
        motivo: 'prueba1',
        descripcion: 'verificando funcionamiento',
        reporterId: '691bf9c02e5f2fe2ab3bd061',
        reportedId: '691d22242870400925962996',
        createdAt: '2025-11-20T02:24:39.490Z',
        updatedAt: '2025-11-20T02:24:39.490Z',
        __v: 0,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Reporte no encontrado' })
  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID del reporte' })
  @ApiOperation({ summary: 'Obtener reporte por ID' })
  async obtenerPorId(@Param('id') id: string) {
    return this.reportesService.obtenerReportePorId(id);
  }

  @ApiResponse({
    status: 200,
    description: 'Lista de reportes filtrados por tipo',
    schema: {
      example: [
        {
          _id: '691e7be79b2b15a661b69bed',
          type: 'USUARIO',
          motivo: 'prueba1',
          descripcion: 'verificando funcionamiento',
          reporterId: '691bf9c02e5f2fe2ab3bd061',
          reportedId: '691d22242870400925962996',
          createdAt: '2025-11-20T02:24:39.490Z',
          updatedAt: '2025-11-20T02:24:39.490Z',
          __v: 0,
        },
        {
          _id: '691e7be79b2b15a661b69bee',
          type: 'COMUNIDAD',
          motivo: 'spam',
          descripcion: 'publica contenido repetitivo',
          reporterId: '691bf9c02e5f2fe2ab3bd061',
          reportedId: '691d22242870400925962997',
          createdAt: '2025-11-21T02:24:39.490Z',
          updatedAt: '2025-11-21T02:24:39.490Z',
          __v: 0,
        },
      ],
    },
  })
  @Get()
  @ApiQuery({ name: 'type', enum: TypeEnumReport, required: false })
  @ApiOperation({ summary: 'Listar reportes filtrando por tipo' })
  async obtenerReportes(@Query('type') type?: TypeEnumReport) {
    return this.reportesService.obtenerReportesPorTipo(type);
  }

  @ApiResponse({
    status: 200,
    description: 'Reporte eliminado correctamente',
    schema: {
      example: {
        message: 'Reporte eliminado correctamente',
        reporte: {
          _id: '691e7be79b2b15a661b69bed',
          type: 'USUARIO',
          motivo: 'prueba1',
          descripcion: 'verificando funcionamiento',
          reporterId: '691bf9c02e5f2fe2ab3bd061',
          reportedId: '691d22242870400925962996',
          createdAt: '2025-11-20T02:24:39.490Z',
          updatedAt: '2025-11-20T02:24:39.490Z',
          __v: 0,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'El reporte no existe o ya fue eliminado',
  })
  @Delete(':id')
  @ApiParam({ name: 'id', description: 'ID del reporte' })
  @ApiOperation({ summary: 'Eliminar reporte por ID' })
  async eliminarReporte(@Param('id') id: string) {
    return this.reportesService.eliminarReporte(id);
  }
}
