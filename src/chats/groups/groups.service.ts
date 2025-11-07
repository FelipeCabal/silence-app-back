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

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Grupos.name) private readonly gruposModel: Model<Grupos>,
    @InjectModel(InvitacionesGrupos.name)
    private readonly invitacionesModel: Model<InvitacionesGrupos>,
  ) {}

  async create(dto: CreateGrupoDto, creatorId: string) {
    const grupo = await this.gruposModel.create({
      ...dto,
      membersSummary: {
        _id: new Types.ObjectId(creatorId),
      },
    });

    return GrupoResponseDto.fromModel(grupo);
  }

  async invite(grupoId: string, userId: string) {
    const exists = await this.invitacionesModel.findOne({
      grupo: grupoId,
      user: userId,
    });

    if (exists) {
      throw new ConflictException('Ya existe una invitación para este usuario.');
    }

    const invitacion = await this.invitacionesModel.create({
      user: userId,
      grupo: grupoId,
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
}
