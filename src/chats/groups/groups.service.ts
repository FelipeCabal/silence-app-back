import {
  Injectable,
  NotFoundException,
  ConflictException,
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

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Grupos.name) private readonly gruposModel: Model<Grupos>,
    @InjectModel(InvitacionesGrupos.name)
    private readonly invitacionesModel: Model<InvitacionesGrupos>,
    private readonly userService: UsersService,
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

  return GrupoResponseDto.fromModel(grupo);
  }




  async findAll() {
    const grupos = await this.gruposModel.find().lean();
    return grupos.map((g) => GrupoResponseDto.fromModel(g));
  }

  async findById(id: string) {
    const grupo = await this.gruposModel.findById(id).lean();

    if (!grupo) throw new NotFoundException('Grupo no encontrado.');

    return GrupoResponseDto.fromModel(grupo);
  }

  async remove(id: string) {
    const deleted = await this.gruposModel.findByIdAndDelete(id);

    if (!deleted) throw new NotFoundException('Grupo no encontrado.');

    await this.invitacionesModel.deleteMany({ grupo: id });

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
        _id: userObjectId,
        nombre: user.nombre,
        avatar: user.imagen ?? null,
      },
      rol: Role.Member, 
    };

    grupo.members.push(newMember);
    await grupo.save();

    return GrupoResponseDto.fromModel(grupo);
  }
}
