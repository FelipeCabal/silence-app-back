import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvitacionesGrupos } from 'src/chats/schemas/invitations.schema';
import { CreateInvitationDto } from 'src/chats/dto/invitation/request/CreateInvitationDto';
import { UsersService } from 'src/users/services/users.service';
import { Status } from 'src/config/enums/status.enum';
import { GroupInvitationsModule } from 'src/chats/module/GroupInvitationsModule';
import { InvitacionSimpleModel } from 'src/chats/models/InvitacionSimpleModel';
import { GroupService } from 'src/chats/groups/groups.service';

@Injectable()
export class GroupInvitationsService {
  constructor(
    @InjectModel(InvitacionesGrupos.name)
    private readonly groupInvitationModel: Model<InvitacionesGrupos>,
    private readonly usersService: UsersService,
    private readonly groupService: GroupService,
  ) {}

  async create(data: CreateInvitationDto): Promise<InvitacionSimpleModel> {
    const { senderId, receiverId, groupId } = data;

    if (senderId === receiverId) {
      throw new HttpException(
        'No puedes invitarte a ti mismo',
        HttpStatus.BAD_REQUEST,
      );
    }

    const sender = await this.usersService.findOneUser(senderId);
    const receiver = await this.usersService.findOneUser(receiverId);
    const group = await this.groupService.findById(groupId);

    if (group.membersSummary.some((m) => m._id.toString() === receiverId)) {
      throw new HttpException(
        'El usuario ya está en el grupo',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this.groupInvitationModel.findOne({
      'usuarioSummary._id': receiver._id,
      'groupSummary._id': group.id,
      status: Status.Pendiente,
    });

    if (existing) {
      throw new HttpException(
        'Ya existe una invitación pendiente',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newInvitation = await this.groupInvitationModel.create({
      usuarioSummary: {
        _id: receiver._id,
        nombre: receiver.nombre,
        imagen: receiver.imagen,
      },
      groupSummary: {
        _id: group.id,
        nombre: group.nombre,
        imagen: group.imagen,
      },
      status: Status.Pendiente,
    });

    return InvitacionSimpleModel.fromEntity(newInvitation);
  }

  async accept(
    invitationId: string,
    userId: string,
  ): Promise<InvitacionSimpleModel> {
    const invitation = await this.groupInvitationModel.findById(invitationId);

    if (!invitation) {
      throw new NotFoundException('Invitación no encontrada');
    }

    if (invitation.status !== Status.Pendiente) {
      throw new HttpException(
        'La invitación ya fue procesada',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (invitation.usuarioSummary._id.toString() !== userId) {
      throw new HttpException(
        'No estás autorizado para aceptar esta invitación',
        HttpStatus.UNAUTHORIZED,
      );
    }

    invitation.status = Status.Aceptada;
    await invitation.save();

    await this.groupService.addUserToGroup(
      invitation.groupSummary._id.toString(),
      invitation.usuarioSummary._id,
    );

    return InvitacionSimpleModel.fromEntity(invitation);
  }

  async reject(invitationId: string, userId: string): Promise<void> {
    const invitation = await this.groupInvitationModel.findById(invitationId);

    if (!invitation) {
      throw new NotFoundException('Invitación no encontrada');
    }

    if (invitation.usuarioSummary._id.toString() !== userId) {
      throw new HttpException(
        'No estás autorizado para rechazar esta invitación',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.groupInvitationModel.deleteOne({ _id: invitationId });
  }

  async findByUser(userId: string): Promise<InvitacionSimpleModel[]> {
    const invitations = await this.groupInvitationModel.find({
      'usuarioSummary._id': userId,
    });
    return invitations.map((inv) => InvitacionSimpleModel.fromEntity(inv));
  }

  async findOne(id: string): Promise<InvitacionSimpleModel | null> {
    const invitation = await this.groupInvitationModel.findById(id);
    return invitation ? InvitacionSimpleModel.fromEntity(invitation) : null;
  }

  async findSimpleByUser(userId: string): Promise<InvitacionSimpleModel[]> {
    const invitations = await this.groupInvitationModel.find({
      'usuarioSummary._id': userId,
    });
    return invitations.map((inv) => InvitacionSimpleModel.fromEntity(inv));
  }
}
