import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvitacionesGrupos } from 'src/chats/schemas/invitations.schema';
import { CreateInvitationDto } from 'src/chats/dto/invitation/request/CreateInvitationDto';
import { UsersService } from 'src/users/services/users.service';
import { Status } from 'src/config/enums/status.enum';
import { InvitacionSimpleModel } from 'src/chats/models/InvitacionSimpleModel';
import { GroupService } from 'src/chats/groups/groups.service';

import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class GroupInvitationsService {
  constructor(
    @InjectModel(InvitacionesGrupos.name)
    private readonly groupInvitationModel: Model<InvitacionesGrupos>,
    private readonly usersService: UsersService,
    private readonly groupService: GroupService,

    private readonly redisService: RedisService,
  ) { }

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
    const group = await this.groupService.findById(groupId,senderId);

    if (group.members.some((m) => m.user._id.toString() === receiverId)) {
      throw new HttpException(
        'El usuario ya está en el grupo',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this.groupInvitationModel.findOne({
      'user._id': receiver._id,
      'group._id': group.id,
      status: Status.Pendiente,
    });

    if (existing) {
      throw new HttpException(
        'Ya existe una invitación pendiente',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newInvitation = await this.groupInvitationModel.create({
      user: {
        _id: receiver._id,
        nombre: receiver.nombre,
        imagen: receiver.imagen,
      },
      group: {
        _id: group.id,
        nombre: group.nombre,
        imagen: group.imagen,
      },
      status: Status.Pendiente,
    });

    await this.redisService.client.del(`groupInvitations:user:${receiverId}`);

    return InvitacionSimpleModel.fromEntity(newInvitation);
  }

  async accept(invitationId: string, userId: string): Promise<InvitacionSimpleModel> {
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

    if (invitation.user._id.toString() !== userId.toString()) {
      throw new UnauthorizedException('No estás autorizado para aceptar esta invitación');
    }

    invitation.status = Status.Aceptada;
    await invitation.save();

    await this.groupService.addUserToGroup(
      invitation.group._id.toString(),
      invitation.user._id.toString(),
    );

    await this.redisService.client.del(`groupInvitations:user:${userId}`);
    await this.redisService.client.del(`group:${invitation.group._id.toString()}:members`);

    return InvitacionSimpleModel.fromEntity(invitation);
  }

  async reject(invitationId: string, userId: string): Promise<void> {
    const invitation = await this.groupInvitationModel.findById(invitationId);

    if (!invitation) {
      throw new NotFoundException('Invitación no encontrada');
    }

    if (invitation.user._id.toString() !== userId) {
      throw new HttpException(
        'No estás autorizado para rechazar esta invitación',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.groupInvitationModel.deleteOne({ _id: invitationId });

    await this.redisService.client.del(`groupInvitations:user:${userId}`);
  }

  async findByUser(userId: string): Promise<InvitacionSimpleModel[]> {
    const cacheKey = `groupInvitations:user:${userId}`;
    const cached = await this.redisService.client.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const invitations = await this.groupInvitationModel.find({
      'user._id': userId,
    });
    const result = invitations.map((inv) => InvitacionSimpleModel.fromEntity(inv));

    await this.redisService.client.set(cacheKey, JSON.stringify(result), 'EX', 600);
    return result;
  }

  async findOne(id: string): Promise<InvitacionSimpleModel | null> {
    const cacheKey = `groupInvitations:invitation:${id}`;
    const cached = await this.redisService.client.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const invitation = await this.groupInvitationModel.findById(id);
    if (!invitation) {
      return null;
    }

    const result = InvitacionSimpleModel.fromEntity(invitation);
    await this.redisService.client.set(cacheKey, JSON.stringify(result), 'EX', 600);
    return result;
  }

  async findSimpleByUser(userId: string): Promise<InvitacionSimpleModel[]> {
    const invitations = await this.groupInvitationModel.find({
      'user._id': userId,
    });
    return invitations.map((inv) => InvitacionSimpleModel.fromEntity(inv));
  }

  /**
   * Get list of users with pending invitations for a specific group
   */
  async getPendingInvitationsByGroup(groupId: string, userId: string) {
    // Verify user has access to the group
    const group = await this.groupService.findById(groupId, userId);
    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    // Get all pending invitations for this group
    const invitations = await this.groupInvitationModel
      .find({
        'group._id': groupId,
        status: Status.Pendiente
      })
      .lean();

    // Return only user info (_id, nombre, imagen)
    return invitations.map((inv: any) => ({
      _id: inv.user._id.toString ? inv.user._id.toString() : inv.user._id,
      nombre: inv.user.nombre,
      imagen: inv.user.imagen || null
    }));
  }
}
