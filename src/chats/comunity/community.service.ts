import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comunidades } from '../schemas/community.schema';
import { Role } from 'src/config/enums/roles.enum';
import { CreateComunidadDto } from '../request/community.dto';
import { ComunidadResponseDto } from '../response/community.response';
import { MiembrosComunidades } from '../schemas/miembros-community.schema';
import { RedisService } from 'src/redis/redis.service';
import { UserSchema } from 'src/users/entities/users.schema';
import { User } from 'src/users/entities/user.model';
import { Types } from 'mongoose';
import { CommunitySummaryResponseDto } from '../models/communitySummarylarge';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Comunidades.name)
    private readonly comunidadesModel: Model<Comunidades>,
    @InjectModel(UserSchema.name)
    private readonly userModel: Model<UserSchema>,
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

    await this.userModel.updateOne(
      { _id: userId },
      {
        $push: {
          comunidades: {
            _id: comunidad._id,
            nombre: comunidad.nombre,
            imagen: comunidad.imagen ?? null,
          },
        },
      },
    );

    return ComunidadResponseDto.fromModel(comunidad);
  }

  async findAllByUser(userId: string) {
  const user = await this.userModel.findById(userId).lean();

  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }

  const communities = user.comunidades ?? [];

  if (communities.length === 0) {
    throw new NotFoundException({
      err: true,
      msg: 'El usuario no pertenece a ninguna comunidad',
    });
  }

  const communityIds = communities.map((c) => new Types.ObjectId(c._id));

  const comunidades = await this.comunidadesModel
    .find({ _id: { $in: communityIds } })
    .select('_id nombre imagen lastMessage lastMessageDate')
    .sort({ lastMessageDate: -1 }) 
    .lean();

  return comunidades.map((c) => CommunitySummaryResponseDto.fromModel(c));
}

async findById(id: string, userId: string) {
  const comunidad = await this.comunidadesModel
    .findById(id)
    .select('_id nombre imagen lastMessage lastMessageDate miembros.user') 
    .lean();

  if (!comunidad) {
    throw new NotFoundException('Comunidad no encontrada.');
  }

  const esMiembro = comunidad.miembros?.some(
    (m) => m.user._id.toString() === userId.toString()
  );

  if (!esMiembro) {
    throw new ForbiddenException(
      'No tienes permiso para ver esta comunidad. No eres miembro.'
    );
  }

  return CommunitySummaryResponseDto.fromModel(comunidad);
}


  async addMiembro(comunidadId: string, userId: string) {
    try {
      const comunidadObjectId = new Types.ObjectId(comunidadId);
      const userObjectId = new Types.ObjectId(userId);

      const yaMiembro = await this.comunidadesModel.findOne({
        _id: comunidadObjectId,
        'miembros.user._id': userObjectId,
      });

      if (yaMiembro) {
        throw new ConflictException('Ya es miembro de esta comunidad.');
      }

      const comunidad = await this.comunidadesModel.findById(comunidadObjectId).lean();
      if (!comunidad) {
        throw new NotFoundException('Comunidad no encontrada.');
      }

      const user = await this.userModel
        .findById(userObjectId)
        .select('_id nombre imagen')
        .lean();
      
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const nuevoMiembro = {
        user: {
          _id: userObjectId,
          nombre: user.nombre,
          avatar: user.imagen ?? null,
        },
        rol: Role.Member,
      };

      const result = await this.comunidadesModel.updateOne(
        { _id: comunidadObjectId },
        { $push: { miembros: nuevoMiembro } },
      );

      if (result.modifiedCount === 0) {
        throw new NotFoundException('No se pudo agregar el miembro a la comunidad.');
      }

      // Agregar comunidad al usuario con id + nombre
      await this.userModel.updateOne(
        { _id: userObjectId },
        {
          $addToSet: {
            comunidades: {
              _id: comunidadObjectId,
              nombre: comunidad.nombre,
            },
          },
        },
      );

      // Invalidar caché
      try {
        await this.redisService.client.del(`community:${comunidadId}:members`);
        await this.redisService.client.del(`user:${userId}:communities`);
      } catch (err) {
        console.warn('Redis no disponible para invalidar caché:', err.message);
      }

      return { message: 'Miembro agregado exitosamente.' };
    } catch (error) {
      console.error('Error en addMiembro:', error);
      throw error;
    }
  }


  async removeMember(
    communityId: string,
    memberId: string,
    requesterId: string,
  ) {
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

    await this.userModel.updateOne(
      { _id: memberObjectId },
      { $pull: { comunidades: { _id: communityObjectId } } },
    );

    await this.redisService.client.del(`community:${comunidad._id}:members`);

    return {
      removed: true,
      message: 'Miembro eliminado correctamente por un administrador',
    };
  }

  async removeCommunity(comunidadId: string, userId: string) {
  const comunidadObjectId = new Types.ObjectId(comunidadId);
  const userObjectId = new Types.ObjectId(userId);

  const comunidad = await this.comunidadesModel.findById(comunidadObjectId).lean();

  if (!comunidad) {
    throw new NotFoundException('Comunidad no encontrada.');
  }

  const esAdmin = comunidad.miembros.some(
    (m) =>
      m.user._id.toString() === userObjectId.toString() &&
      m.rol === Role.Admin
  );

  if (!esAdmin) {
    throw new ForbiddenException(
      'Solo el administrador de la comunidad puede eliminarla.'
    );
  }

  await this.comunidadesModel.findByIdAndDelete(comunidadObjectId);

  await this.userModel.updateMany(
    { 'comunidades._id': comunidadObjectId },
    { $pull: { comunidades: { _id: comunidadObjectId } } }
  );

  return {
    deleted: true,
    message: 'Comunidad eliminada exitosamente.',
  };
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

    await this.userModel.updateOne(
      { _id: userId },
      { $pull: { comunidades: { _id: communityObjectId } } },
    );

    return {
      left: true,
      message: 'Has salido de la comunidad correctamente',
    };
  }

  async addMessage(comunidadId: string, userId: string, message: string) {
    const comunidad = await this.comunidadesModel.findById(comunidadId);

    if (!comunidad) {
      throw new NotFoundException('Comunidad no encontrada');
    }

    const isMember = comunidad.miembros.some(
      (m) => m.user._id.toString() === userId,
    );

    if (!isMember) {
      throw new ForbiddenException(
        'No puedes enviar mensajes en esta comunidad',
      );
    }

    if (!Array.isArray(comunidad.mensajes)) {
      comunidad.mensajes = [];
    }

    comunidad.mensajes.push({
      remitente: new Types.ObjectId(userId),
      mensaje: message,
      fecha: new Date(),
    });

    comunidad.lastMessage = message;
    comunidad.lastMessageDate = new Date();

    await comunidad.save();

    await this.redisService.client.del(`community:${comunidadId}:messages`);

    return {
      _id: comunidad._id,
      mensaje: message,
      remitente: userId,
      fecha: new Date(),
    };
  }

async getAllCommunities(
  search?: string,
  page: number = 1,
  limit: number = 10,
) {
  const filter: any = {};

  if (search && search.trim()) {
    filter.nombre = { $regex: search.trim(), $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [total, comunidades] = await Promise.all([
    this.comunidadesModel.countDocuments(filter),
    this.comunidadesModel
      .find(filter)
      .select('_id nombre imagen lastMessage lastMessageDate') 
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    results: comunidades.map((c) =>
      CommunitySummaryResponseDto.fromModel(c),
    ),
  };
}

}
