import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Grupos } from '../schemas/groups.schema';
import { InvitacionesGrupos } from '../schemas/invitations.schema';
import { Status } from 'src/config/enums/status.enum';
import { CreateGrupoDto } from '../request/create-group.dto';
import { GrupoResponseDto } from '../response/group.response';
import { User } from 'src/users/entities/user.model';
import { UsersService } from 'src/users/services/users.service';
import { Role } from 'src/config/enums/roles.enum';

import { RedisService } from 'src/redis/redis.service';
import { UserSchema } from 'src/users/entities/users.schema';
import { GrupoSummaryResponseDto } from '../response/group.response.large';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Grupos.name) private readonly gruposModel: Model<Grupos>,
    @InjectModel(InvitacionesGrupos.name)
    private readonly invitacionesModel: Model<InvitacionesGrupos>,
    @InjectModel(UserSchema.name)
    private readonly userModel: Model<UserSchema>,
    private readonly userService: UsersService,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateGrupoDto, creatorId: string) {
    const users = await this.gruposModel.db
      .collection('users')
      .findOne({ _id: new Types.ObjectId(creatorId) });

    if (!users) throw new NotFoundException('Usuario no encontrado');

    const miembro = {
      user: {
        _id: users._id,
        username: users.username,
        nombre: users.nombre,
        avatar: users.avatar ?? null,
      },
      rol: Role.Admin,
    };

    const grupo = await this.gruposModel.create({
      ...dto,
      members: [miembro],
      creatorId: new Types.ObjectId(creatorId),
    });

    await this.userModel.updateOne(
  { _id: creatorId },
  { $push: { grupos: { _id: grupo._id } } },
);

    return GrupoResponseDto.fromModel(grupo);
  }

  async findAll(userId: string) {
  const user = await this.userModel.findById(userId).lean();

  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }

  const groupSummaries = user.grupos ?? [];

  if (groupSummaries.length === 0) {
    throw new NotFoundException({
      err: true,
      msg: 'El usuario no pertenece a ningún grupo',
    });
  }

  const groupIds = groupSummaries.map((g) => new Types.ObjectId(g._id));

  const grupos = await this.gruposModel
    .find({ _id: { $in: groupIds } })
    .lean();

  return grupos.map((g) => GrupoSummaryResponseDto.fromModel(g));
}


  async findById(id: string, userId: string) {
    const grupo = await this.gruposModel.findById(id).lean();

    if (!grupo) throw new NotFoundException('Grupo no encontrado.');
      const esMiembro = grupo.members?.some(
    (m) => m.user._id.toString() === userId.toString(),
  );

  if (!esMiembro) {
    throw new ForbiddenException(
      'No tienes permiso para ver este grupo. No eres miembro.',
    );
  }

    return GrupoResponseDto.fromModel(grupo);
  }

  async remove(id: string, userId: string) {
    const groupObjectId = new Types.ObjectId(id);
    const userObjectId = new Types.ObjectId(userId);

    const grupo = await this.gruposModel.findById(groupObjectId).lean();

    if (!grupo) throw new NotFoundException('Grupo no encontrado.');

    const admin = grupo.members.find((m) => m.rol === 'admin');
    if (!admin)
      throw new ForbiddenException(
        'Este grupo no tiene administrador asignado.',
      );

    if (admin.user._id.toString() !== userObjectId.toString()) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este grupo.',
      );
    }

    await this.userModel.updateMany(
    { "grupos._id": id },
    { $pull: { grupos: { _id: id } } }
  );

    await this.gruposModel.findByIdAndDelete(groupObjectId);
    await this.invitacionesModel.deleteMany({ grupo: groupObjectId });

    return { deleted: true };
  }

  async addUserToGroup(groupId: string, userId: string) {
    const grupoObjectId = new Types.ObjectId(groupId);
    const userObjectId = new Types.ObjectId(userId);

    const grupo = await this.gruposModel.findById(grupoObjectId);
    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado.');
    }

    const alreadyMember = grupo.members?.some(
      (member) => member.user._id.toString() === userObjectId.toString(),
    );

    if (alreadyMember) {
      throw new ConflictException('El usuario ya pertenece al grupo.');
    }

    const user = await this.userService.findOneUser(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const newMember = {
      user: {
        _id: userObjectId.toString(),
        nombre: user.nombre,
        avatar: user.imagen ?? null,
      },

      rol: Role.Member,
    };

    grupo.members.push(newMember);
    await grupo.save();

      await this.userModel.updateOne(
    { _id: userId },
    { $push: { grupos: { _id: groupId } } },
  );
    return GrupoResponseDto.fromModel(grupo);
  }

  async leaveGroup(groupId: string, userId: string) {
    const groupObjectId = new Types.ObjectId(groupId);
    const userObjectId = new Types.ObjectId(userId);

    const grupo = await this.gruposModel.findById(groupObjectId);

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    const miembro = grupo.members.find(
      (m) => m.user._id.toString() === userObjectId.toString(),
    );

    if (!miembro) {
      throw new NotFoundException('No perteneces a este grupo');
    }

    if (miembro.rol === Role.Admin) {
      const admins = grupo.members.filter((m) => m.rol === Role.Admin);

      if (admins.length === 1) {
        const otroMiembro = grupo.members.find(
          (m) => m.user._id.toString() !== userObjectId.toString(),
        );

        if (otroMiembro) {
          otroMiembro.rol = Role.Admin;
          await grupo.save();
        } else {
          throw new BadRequestException(
            'No puedes salir, no hay más miembros para asignar como admin',
          );
        }
      }
    }

    

    grupo.members = grupo.members.filter(
      (m) => m.user._id.toString() !== userObjectId.toString(),
    );
  await this.userModel.updateOne(
    { _id: userId },
    { $pull: { grupos: { _id: groupId } } },
  );
    await grupo.save();
    await this.redisService.client.del(`group:${groupId}:members`);

    return {
      left: true,
      message: 'Has salido del grupo correctamente',
    };
  }

  async removeMember(groupId: string, memberId: string, requesterId: string) {
  const groupObjectId = new Types.ObjectId(groupId);
  const memberObjectId = new Types.ObjectId(memberId);
  const requesterObjectId = new Types.ObjectId(requesterId);

  const grupo = await this.gruposModel.findById(groupObjectId);

  if (!grupo) {
    throw new NotFoundException('Grupo no encontrado');
  }

  const requester = grupo.members.find(
    (m) => m.user._id.toString() === requesterObjectId.toString(),
  );

  if (!requester) {
    throw new ForbiddenException('No perteneces a este grupo');
  }

  if (requester.rol !== Role.Admin) {
    throw new ForbiddenException(
      'Solo los administradores pueden eliminar miembros',
    );
  }

  const miembroAEliminar = grupo.members.find(
    (m) => m.user._id.toString() === memberObjectId.toString(),
  );

  if (!miembroAEliminar) {
    throw new NotFoundException('El usuario no es miembro de este grupo');
  }

  if (requesterId === memberId) {
    throw new BadRequestException('No puedes eliminarte a ti mismo');
  }

  if (miembroAEliminar.rol === Role.Admin) {
    throw new ForbiddenException('No puedes eliminar a otro administrador');
  }

  const updatedMembers = grupo.members.filter(
    (m) => m.user._id.toString() !== memberObjectId.toString(),
  );

  await this.gruposModel.updateOne(
    { _id: groupObjectId },
    { $set: { members: updatedMembers } },
  );

  await this.userModel.updateOne(
    { _id: memberObjectId },
    { $pull: { grupos: { _id: groupObjectId } } },
  );

  await this.redisService.client.del(`group:${groupId}:members`);

  return {
    removed: true,
    message: 'Miembro eliminado correctamente por un administrador',
  };
}

  async addMessage(groupId: string, userId: string, message: string) {
    const grupo = await this.gruposModel.findById(groupId);
    if (!grupo) throw new NotFoundException('Grupo no encontrado.');

    const isMember = grupo.members.some(
      (m) => m.user._id.toString() === userId,
    );
    if (!isMember) throw new ForbiddenException('No perteneces a este grupo.');

    if (!Array.isArray(grupo.mensajes)) {
      grupo.mensajes = [];
    }

    grupo.mensajes.push({
      remitente: new Types.ObjectId(userId),
      mensaje: message,
      fecha: new Date(),
    });

    grupo.lastMessage = message;
    grupo.lastMessageDate = new Date();
    await grupo.save();

    await this.redisService.client.del(`group:${groupId}:messages`);

    return {
      _id: grupo._id,
      mensaje: message,
      remitente: userId,
      fecha: new Date(),
    };
  }
}
