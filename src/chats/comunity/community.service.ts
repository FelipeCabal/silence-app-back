import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comunidades } from '../entitesNosql/community.schema';
import { MiembrosComunidades } from '../entities/miembrosComunidad.entity';
import { CreateComunidadDto } from './dto/create-community.dto';
import { Role } from 'src/config/enums/roles.enum';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Comunidades.name)
    private readonly comunidadesModel: Model<Comunidades>,
    @InjectModel(MiembrosComunidades.name)
    private readonly miembrosModel: Model<MiembrosComunidades>,
  ) {}

  async create(dto: CreateComunidadDto, userId: string): Promise<Comunidades> {
    const exists = await this.comunidadesModel.findOne({ nombre: dto.nombre });
    if (exists) throw new ConflictException('Ya existe una comunidad con ese nombre.');

    const comunidad = await this.comunidadesModel.create(dto);

    await this.miembrosModel.create({
      comunidad: comunidad._id,
      usuario: new Types.ObjectId(userId),
      rol: Role.Admin,
    });

    return comunidad;
  }

  async findAll(): Promise<Comunidades[]> {
    return this.comunidadesModel.find().populate('miembros');
  }

  async findById(id: string): Promise<Comunidades> {
    const comunidad = await this.comunidadesModel
      .findById(id)
      .populate({ path: 'miembros', populate: { path: 'usuario' } });
    if (!comunidad) throw new NotFoundException('Comunidad no encontrada.');
    return comunidad;
  }

  async addMiembro(comunidadId: string, usuarioId: string): Promise<void> {
    const comunidad = await this.comunidadesModel.findById(comunidadId);
    if (!comunidad) throw new NotFoundException('Comunidad no encontrada.');

    const yaMiembro = await this.miembrosModel.findOne({
      comunidad: comunidadId,
      usuario: usuarioId,
    });
    if (yaMiembro) throw new ConflictException('Ya eres miembro de esta comunidad.');

    await this.miembrosModel.create({
      comunidad: comunidadId,
      usuario: usuarioId,
      rol: Role.Member,
    });
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.comunidadesModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Comunidad no encontrada.');
    await this.miembrosModel.deleteMany({ comunidad: id });
  }
}
