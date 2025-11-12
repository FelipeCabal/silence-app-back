import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
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
  ) { }

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

  async findAll(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const comunidades = await this.comunidadesModel
      .find({ 'miembros.user._id': userObjectId })
      .lean();

    if (!comunidades || comunidades.length === 0) {
      return [];
    }

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

    return { message: 'Miembro agregado exitosamente.' };
  }

  async remove(communityId: string, memberId: string, requesterId: string) {
    const communityObjectId = new Types.ObjectId(communityId);
    const memberObjectId = new Types.ObjectId(memberId);
    const requesterObjectId = new Types.ObjectId(requesterId);

    const comunidad = await this.comunidadesModel.findById(communityObjectId);


    if (!comunidad) {
      throw new NotFoundException('Comunidad no encontrada');
    }

    const requester = comunidad.miembros.find(
      (m) => m.user._id.toString() === requesterObjectId.toString(),
    );

    if (!requester) {
      throw new ForbiddenException('No perteneces a esta comunidad');
    }

    if (requester.rol !== 'admin') {
      throw new ForbiddenException(
        'Solo los administradores pueden eliminar miembros',
      );
    }

    const miembroAEliminar = comunidad.miembros.find(
      (m) => m.user._id.toString() === memberObjectId.toString(),
    );

    if (!miembroAEliminar) {
      throw new NotFoundException('El usuario no es miembro de esta comunidad');
    }

    if (requesterId === memberId) {
      throw new BadRequestException('No puedes eliminarte a ti mismo');
    }
    const updatedMembers = comunidad.miembros.filter(
      (m) => m.user._id.toString() !== memberObjectId.toString(),
    );

    await this.comunidadesModel.updateOne(
      { _id: communityObjectId },
      { $set: { miembros: updatedMembers } },
    );
    await this.redisService.client.del(`community:${comunidad._id}:members`);

    return {
      removed: true,
      message: 'Miembro eliminado correctamente por un administrador',
    }
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

  async leaveCommunity(communityId: string, userId: string) {
  const communityObjectId = new Types.ObjectId(communityId);
  const userObjectId = new Types.ObjectId(userId);

  const comunidad = await this.comunidadesModel.findById(communityObjectId);

  if (!comunidad) {
    throw new NotFoundException('Comunidad no encontrada');
  }

  const miembro = comunidad.miembros.find(
    (m) => m.user._id.toString() === userObjectId.toString(),
  );

  if (!miembro) {
    throw new NotFoundException('No perteneces a esta comunidad');
  }

  if (miembro.rol === 'admin') {
    const admins = comunidad.miembros.filter((m) => m.rol === 'admin');

    if (admins.length === 1) {
      const otroMiembro = comunidad.miembros.find(
        (m) => m.user._id.toString() !== userObjectId.toString(),
      );

      if (otroMiembro) {
        otroMiembro.rol = 'admin';
        await comunidad.save(); 
      } else {
        throw new BadRequestException(
          'No puedes salir, no hay más miembros para asignar como admin',
        );
      }
    }
  }

  comunidad.miembros = comunidad.miembros.filter(
    (m) => m.user._id.toString() !== userObjectId.toString(),
  );

  await comunidad.save();

  return {
    left: true,
    message: 'Has salido de la comunidad correctamente',
  };
}

}
