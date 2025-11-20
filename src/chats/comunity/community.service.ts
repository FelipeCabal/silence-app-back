import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comunidades } from '../schemas/community.schema';
import { Role } from 'src/config/enums/roles.enum';
import { CreateComunidadDto } from '../request/community.dto';
import { ComunidadResponseDto } from '../response/community.response';
import { MiembrosComunidades } from '../schemas/miembros-community.schema';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Comunidades.name)
    private readonly comunidadesModel: Model<Comunidades>,
    @InjectModel(MiembrosComunidades.name)
    private readonly miembrosModel: Model<MiembrosComunidades>,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateComunidadDto, userId: string) {
    const exists = await this.comunidadesModel.findOne({
      nombre: dto.nombre.trim(),
    });

    if (exists) {
      throw new ConflictException('Ya existe una comunidad con ese nombre.');
    }

    const user = await this.comunidadesModel.db
      .collection('users')
      .findOne({ _id: new Types.ObjectId(userId) });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const miembro = {
      user: {
        _id: user._id,
        nombre: user.nombre,
        avatar: user.avatar ?? null,
      },
      rol: Role.Admin,
    };

    const comunidad = await this.comunidadesModel.create({
      ...dto,
      miembros: [miembro],
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
    const comunidadObjectId = new Types.ObjectId(comunidadId);
    const userObjectId = new Types.ObjectId(userId);

    const comunidadExistente = await this.comunidadesModel.findOne({
      _id: comunidadObjectId,
      'miembros.user._id': userObjectId,
    });

    if (comunidadExistente) {
      throw new ConflictException('Ya es miembro de esta comunidad.');
    }

    const user = await this.comunidadesModel.db
      .collection('users')
      .findOne({ _id: userObjectId });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const nuevoMiembro = {
      user: {
        _id: userObjectId,
        nombre: user.nombre,
        avatar: user.avatar ?? null,
      },
      rol: Role.Member,
    };

    const result = await this.comunidadesModel.updateOne(
      { _id: comunidadObjectId },
      { $push: { miembros: nuevoMiembro } },
    );

    if (result.modifiedCount === 0) {
      throw new NotFoundException('Comunidad no encontrada.');
    }

    await this.redisService.client.del(`community:${comunidadId}:members`);

    return { message: 'Miembro agregado exitosamente.' };
  }

  async remove(comunidadId: string, userId: string) {
    const comunidadObjectId = new Types.ObjectId(comunidadId);
    const userObjectId = new Types.ObjectId(userId);

    const comunidad = await this.comunidadesModel.findById(comunidadObjectId);

    if (!comunidad) {
      throw new NotFoundException('Comunidad no encontrada');
    }

    const esMiembro = comunidad.miembros.some(
      (m) => m.user._id.toString() === userObjectId.toString(),
    );

    if (!esMiembro) {
      throw new NotFoundException('El usuario no es miembro de esta comunidad');
    }

    const result = await this.comunidadesModel.updateOne(
      { _id: comunidadObjectId },
      { $pull: { miembros: { 'user._id': { $eq: userObjectId } } } },
    );

    if (result.modifiedCount === 0) {
      throw new BadRequestException(
        'No se eliminó el miembro (no coincidió en la base de datos)',
      );
    }

    await this.redisService.client.del(`community:${comunidadId}:members`);

    return { removed: true, message: 'Miembro eliminado exitosamente' };
  }

  async removeCommunity(comunidadId: string) {
    const comunidadObjectId = new Types.ObjectId(comunidadId);

    const comunidad = await this.comunidadesModel.findById(comunidadObjectId);
    if (!comunidad) {
      throw new NotFoundException('Comunidad no encontrada.');
    }

    await this.comunidadesModel.findByIdAndDelete(comunidadObjectId);

    return { deleted: true, message: 'Comunidad eliminada exitosamente' };
  }
}
