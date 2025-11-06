import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvitacionesGrupos } from '../entities/invitaciones.schema';
import { CreateInvitationDto } from '../dto/invitation/request/CreateInvitationDto';
import { InvitacionGrupoResponseDto } from '../dto/invitation/response/InvitacionGrupoResponseDto';
import { UsersService } from 'src/users/services/users.service';
import { GroupChatsService } from './gruop-chats.service';
import { Status } from 'src/config/enums/status.enum';

@Injectable()
export class GroupInvitationsService {
  constructor(
    @InjectModel(InvitacionesGrupos.name)
    private readonly groupInvitationModel: Model<InvitacionesGrupos>,
    private readonly usersService: UsersService,
    private readonly groupService: GroupChatsService,
  ) {}

  async create(data: CreateInvitationDto): Promise<InvitacionGrupoResponseDto> {
    const { senderId, receiverId, groupId } = data;

    if (senderId === receiverId) {
      throw new HttpException('No puedes invitarte a ti mismo', HttpStatus.BAD_REQUEST);
    }

    const sender = await this.usersService.findOneUser(senderId);
    const receiver = await this.usersService.findOneUser(receiverId);
    const group = await this.groupService.findGroupById(groupId);

    if (group.miembros.some((miembro) => miembro.toString() === receiverId)) {
      throw new HttpException('El usuario ya está en el grupo', HttpStatus.BAD_REQUEST);
    }

    const existing = await this.groupInvitationModel.findOne({
      userId: receiver._id,
      grupoId: group._id,
      status: Status.Pendiente,
    });

    if (existing) {
      throw new HttpException('Ya existe una invitación pendiente', HttpStatus.BAD_REQUEST);
    }

    const newInvitation = await this.groupInvitationModel.create({
      userId: receiver._id,
      grupoId: group._id,
      status: Status.Pendiente,
    });

    return InvitacionGrupoResponseDto.fromModel(newInvitation);
  }

  async accept(invitationId: string, userId: string): Promise<InvitacionGrupoResponseDto> {
    const invitation = await this.groupInvitationModel.findById(invitationId);

    if (!invitation) {
      throw new NotFoundException('Invitación no encontrada');
    }

    if (invitation.status !== Status.Pendiente) {
      throw new HttpException('La invitación ya fue procesada', HttpStatus.BAD_REQUEST);
    }

    if (invitation.userId.toString() !== userId) {
      throw new HttpException('No estás autorizado para aceptar esta invitación', HttpStatus.UNAUTHORIZED);
    }

    invitation.status = Status.Aceptada;
    await invitation.save();

    await this.groupService.addUserToGroup(invitation.grupoId.toString(), invitation.userId);

    return InvitacionGrupoResponseDto.fromModel(invitation);
  }

  async reject(invitationId: string, userId: string): Promise<void> {
    const invitation = await this.groupInvitationModel.findById(invitationId);

    if (!invitation) {
      throw new NotFoundException('Invitación no encontrada');
    }

    if (invitation.userId.toString() !== userId) {
      throw new HttpException('No estás autorizado para rechazar esta invitación', HttpStatus.UNAUTHORIZED);
    }

    await this.groupInvitationModel.deleteOne({ _id: invitationId });
  }

  async findByUser(userId: string): Promise<InvitacionGrupoResponseDto[]> {
    const invitations = await this.groupInvitationModel.find({ userId });
    return invitations.map((inv) => InvitacionGrupoResponseDto.fromModel(inv));
  }

  async findOne(id: string): Promise<InvitacionGrupoResponseDto | null> {
    const invitation = await this.groupInvitationModel.findById(id);
    return invitation ? InvitacionGrupoResponseDto.fromModel(invitation) : null;
  }

  async findSimpleByUser(userId: string): Promise<InvitacionGrupoResponseDto[]> {
    const invitations = await this.groupInvitationModel.find({ userId });
    return invitations.map((inv) => InvitacionGrupoResponseDto.fromModel(inv));
  }
}
