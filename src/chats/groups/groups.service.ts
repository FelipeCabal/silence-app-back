import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InvitacionesGrupos } from '../entitesNosql/invitations.schema';
import { Grupos } from '../entitesNosql/groups.schema';
import { CreateGrupoDto } from './dto/create-group.dto';
import { Status } from 'src/config/enums/status.enum';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Grupos.name) private readonly gruposModel: Model<Grupos>,
    @InjectModel(InvitacionesGrupos.name) private readonly invitacionesModel: Model<InvitacionesGrupos>,
  ) {}

  async create(dto: CreateGrupoDto, creatorId: string): Promise<Grupos> {
    const grupo = await this.gruposModel.create({
      ...dto,
      miembros: [new Types.ObjectId(creatorId)],
    });
    return grupo;
  }

  async invite(grupoId: string, userId: string): Promise<InvitacionesGrupos> {
    const grupo = await this.gruposModel.findById(grupoId);
    if (!grupo) throw new NotFoundException('Grupo no encontrado.');

    const existing = await this.invitacionesModel.findOne({ grupo: grupoId, user: userId });
    if (existing) throw new ConflictException('Ya existe una invitación para este usuario.');

    const invitacion = await this.invitacionesModel.create({
      user: userId,
      grupo: grupoId,
      status: Status.Pendiente,
    });

    //grupo.invitaciones.push(invitacion);
    await grupo.save();

    return invitacion;
  }

  async findAll(): Promise<Grupos[]> {
    return this.gruposModel.find().populate('miembros invitaciones');
  }

  async findById(id: string): Promise<Grupos> {
    const grupo = await this.gruposModel.findById(id).populate('miembros invitaciones');
    if (!grupo) throw new NotFoundException('Grupo no encontrado.');
    return grupo;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.gruposModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Grupo no encontrado.');
    await this.invitacionesModel.deleteMany({ grupo: id });
  }
}
