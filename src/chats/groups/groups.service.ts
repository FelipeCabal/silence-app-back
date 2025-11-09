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
import { UserSummary } from 'src/users/entities/user.model';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Grupos.name) private readonly gruposModel: Model<Grupos>,
    @InjectModel(InvitacionesGrupos.name)
    private readonly invitacionesModel: Model<InvitacionesGrupos>,
    private readonly userService: UsersService,
  ) {}

  async create(dto: CreateGrupoDto, creatorId: string) {
    const user = await this.gruposModel.db
    .collection('users')
    .findOne({ _id: new Types.ObjectId(creatorId) });

  if (!user) throw new NotFoundException('Usuario no encontrado');

  const userSummary = {
    _id: user._id,
    username: user.username,
    nombre: user.nombre,
    avatar: user.avatar ?? null,
  };

  const grupo = await this.gruposModel.create({
    ...dto,
    members: [userSummary], 
    creatorId: new Types.ObjectId(creatorId),
  });

  return GrupoResponseDto.fromModel(grupo);
  }

  async invite(grupoId: string, userId: string) {
    const exists = await this.invitacionesModel.findOne({
      grupo: grupoId,
      user: userId,
    });

    if (exists) {
      throw new ConflictException(
        'Ya existe una invitación para este usuario.',
      );
    }

    const invitacion = await this.invitacionesModel.create({
      user: userId,
      grupo: grupoId,
      usuarioSummary: { _id: new Types.ObjectId(userId) },
      group: { _id: new Types.ObjectId(grupoId) },
      status: Status.Pendiente,
    });

    return invitacion;
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

  async addUserToGroup(groupId: string, userId: any) {
    const grupo = await this.gruposModel.findById(groupId);

    if (!grupo) throw new NotFoundException('Grupo no encontrado.');

    const alreadyMember = grupo.members?.some(
      (member) => member._id.toString() === userId,
    );

    if (alreadyMember)
      throw new ConflictException('El usuario ya pertenece al grupo.');

    const user = await this.userService.findOneUser(userId);

    grupo.members.push({
      _id: new Types.ObjectId(user._id),
      nombre: user.nombre,
      avatar: user.imagen,
    });

    await grupo.save();

    return GrupoResponseDto.fromModel(grupo);
  }
}
