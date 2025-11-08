import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comunidades } from '../schemas/community.schema';
import { Role } from 'src/config/enums/roles.enum';
import { CreateComunidadDto } from '../request/community.dto';
import { ComunidadResponseDto } from '../response/community.response';
import { MiembrosComunidades } from '../schemas/miembros-community.schema';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Comunidades.name)
    private readonly comunidadesModel: Model<Comunidades>,
    @InjectModel(MiembrosComunidades.name)
    private readonly miembrosModel: Model<MiembrosComunidades>,
  ) {}

  async create(dto: CreateComunidadDto, userId: string) {
  const exists = await this.comunidadesModel.findOne({
    nombre: dto.nombre.trim(),
  });

  if (exists) {
    throw new ConflictException('Ya existe una comunidad con ese nombre.');
  }

  const user = await this.miembrosModel.db
    .collection('users')
    .findOne({ _id: new Types.ObjectId(userId) });

  if (!user) throw new NotFoundException('Usuario no encontrado');

  const miembroSummary = {
    _id: user._id,
    nombre: user.nombre,
    avatar: user.avatar ?? null,
  };

  const comunidad = await this.comunidadesModel.create({
    ...dto,
    miembrosSummary: [miembroSummary],
  });

  await this.miembrosModel.create({
    comunidad: comunidad._id,
    usuarioSummary: miembroSummary,
    rol: Role.Admin,
  });

  return ComunidadResponseDto.fromModel(comunidad);
}


  async findAll() {
    const comunidades = await this.comunidadesModel.find().lean();
    return comunidades.map((c) => ComunidadResponseDto.fromModel(c));
  }

  async findById(id: string) {
    const comunidad = await this.comunidadesModel.findById(id).lean();

    if (!comunidad) throw new NotFoundException('Comunidad no encontrada.');

    return ComunidadResponseDto.fromModel(comunidad);
  }

  async addMiembro(comunidadId: string, userId: string) {
  const exists = await this.miembrosModel.findOne({
    comunidad: new Types.ObjectId(comunidadId),
    'usuarioSummary._id': new Types.ObjectId(userId),
  });

  if (exists) {
    throw new ConflictException('Ya es miembro de esta comunidad.');
  }

  const user = await this.miembrosModel.db
    .collection('users')
    .findOne({ _id: new Types.ObjectId(userId) });

  if (!user) throw new NotFoundException('Usuario no encontrado');

  const userSummary = {
    _id: user._id,
    nombre: user.nombre,
    avatar: user.avatar ?? null,
  };

  await this.miembrosModel.create({
    comunidad: new Types.ObjectId(comunidadId),
    usuarioSummary: userSummary,
    rol: Role.Member,
  });

  await this.comunidadesModel.updateOne(
    { _id: new Types.ObjectId(comunidadId) },
    { $push: { miembrosSummary: userSummary } },
  );

  return { message: 'Miembro agregado exitosamente' };
}


  async remove(id: string) {
    const deleted = await this.comunidadesModel.findByIdAndDelete(id);

    if (!deleted) throw new NotFoundException('Comunidad no encontrada.');

    await this.miembrosModel.deleteMany({ comunidad: id });

    return { deleted: true };
  }
}
