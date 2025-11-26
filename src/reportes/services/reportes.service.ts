import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateReporteComunidadDto } from '../dtos/create-reporte-comunidad.dto';
import { CreateReporteUsuarioDto } from '../dtos/create-reporte-usuario.dto';
import { UserSchema } from 'src/users/entities/users.schema';
import { Comunidades } from 'src/chats/schemas/community.schema';
import {
  EstadoEnum,
  UpdateEstadoReporteDto,
  TypeEnumReport,
} from '../dtos/update-reporte.dto';
import { Reporte } from '../schema/reportes.schema';

@Injectable()
export class ReportesService {
  constructor(
    @InjectModel(Reporte.name)
    private readonly reporteModel: Model<Reporte>,

    @InjectModel(UserSchema.name)
    private readonly userModel: Model<UserSchema>,

    @InjectModel(Comunidades.name)
    private readonly comunidadModel: Model<Comunidades>,
  ) {}

  private async validarRemitente(remitenteId: string) {
    const remitente = await this.userModel.findById(remitenteId).lean();
    if (!remitente) {
      throw new NotFoundException('El usuario que reporta no existe.');
    }
  }

  async crearReporteUsuario(
    dto: CreateReporteUsuarioDto,
    reportadoPorId: string,
  ): Promise<Reporte> {
    const { userReportadoId, motivo, descripcion } = dto;

    await this.validarRemitente(reportadoPorId);

    const userReportado = await this.userModel.findById(userReportadoId).lean();
    if (!userReportado) {
      throw new NotFoundException('El usuario reportado no existe.');
    }

    const existe = await this.reporteModel.findOne({
      type: TypeEnumReport.USUARIO,
      reporterId: new Types.ObjectId(reportadoPorId),
      reportedId: new Types.ObjectId(userReportadoId),
      motivo,
    });

    console.log(existe, 'bro?');

    if (existe) {
      throw new Error(
        'Ya existe un reporte pendiente para esta usuario por el mismo motivo.',
      );
    }
    const nuevoReporte = await this.reporteModel.create({
      type: TypeEnumReport.USUARIO,
      motivo,
      descripcion,
      reporterId: new Types.ObjectId(reportadoPorId),
      reportedId: new Types.ObjectId(userReportadoId),
    });

    await this.userModel.findByIdAndUpdate(userReportadoId, {
      $push: {
        reportes: {
          _id: nuevoReporte._id,
          motivo: nuevoReporte.motivo,
        },
      },
    });

    return nuevoReporte;
  }

  async listarReportesUsuarios() {
    return this.reporteModel.find({ type: TypeEnumReport.USUARIO }).lean();
  }

  async crearReporteComunidad(
    dto: CreateReporteComunidadDto,
    reportadoPorId: string,
  ): Promise<Reporte> {
    const { comunidadId, motivo, descripcion } = dto;

    await this.validarRemitente(reportadoPorId);

    const comunidad = await this.comunidadModel.findById(comunidadId).lean();
    if (!comunidad) {
      throw new NotFoundException('La comunidad no existe.');
    }

    const existe = await this.reporteModel.findOne({
      type: TypeEnumReport.COMUNIDAD,
      reporterId: new Types.ObjectId(reportadoPorId),
      reportedId: new Types.ObjectId(comunidadId),
      motivo,
    });

    if (existe) {
      throw new ConflictException(
        'Ya existe un reporte pendiente para esta comunidad por el mismo motivo.',
      );
    }

    const nuevoReporte = await this.reporteModel.create({
      type: TypeEnumReport.COMUNIDAD,
      motivo,
      descripcion,
      reporterId: new Types.ObjectId(reportadoPorId),
      reportedId: new Types.ObjectId(comunidadId),
    });

    await this.comunidadModel.findByIdAndUpdate(comunidadId, {
      $push: {
        reportes: {
          _id: nuevoReporte._id,
          type: nuevoReporte.type,
          motivo: nuevoReporte.motivo,
        },
      },
    });

    return nuevoReporte;
  }

  async obtenerReportePorId(id: string) {
    const reporte = await this.reporteModel.findById(id).lean();
    if (!reporte) throw new NotFoundException('Reporte no encontrado');
    return reporte;
  }

  async obtenerReportesPorTipo(type?: TypeEnumReport) {
    if (!type) return this.reporteModel.find().lean();
    return this.reporteModel.find({ type }).lean();
  }

  //TODO: ELIMINAR SI NO HAREMOS SUPERAdmin
  async eliminarReporte(id: string) {
    const reporte = await this.reporteModel.findByIdAndDelete(id).lean();
    if (!reporte)
      throw new NotFoundException('El reporte no existe o ya fue eliminado');
    return {
      message: 'Reporte eliminado correctamente',
      reporte,
    };
  }
}
