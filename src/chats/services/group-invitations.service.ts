import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvitacionesGrupos } from '../entities/invitaciones.entity';
import { UsersService } from 'src/users/services/users.service';
import { GroupChatsService } from './gruop-chats.service';
import { Status } from 'src/config/enums/status.enum';

@Injectable()
export class GroupInvitationsService {
    constructor(
        @InjectRepository(InvitacionesGrupos)
        private readonly groupInvitationRepository: Repository<InvitacionesGrupos>,

        private readonly usersService: UsersService,

        private readonly groupService: GroupChatsService,
    ) { }

    async createInvitation(senderId: String, receiverId: String, groupId: number): Promise<InvitacionesGrupos> {
        const sender = await this.usersService.findOneUser(senderId);
        const receiver = await this.usersService.findOneUser(receiverId);

        if (senderId === receiverId) {
            throw new HttpException("No puedes invitarte a ti mismo", HttpStatus.BAD_REQUEST);
        }

        const group = await this.groupService.findGroupById(groupId);

        if (group.miembros.some((miembro) => miembro.id === receiverId)) {
            throw new HttpException("User already in group", HttpStatus.BAD_REQUEST)
        }

        const invitation = await this.groupInvitationRepository.findOne({
            where: { user: receiver, grupo: group }
        });

        if (invitation && invitation.status == Status.Pendiente) {
            throw new HttpException("Invitation already exist", HttpStatus.BAD_REQUEST)
        }

        const newInvitation = this.groupInvitationRepository.create({
            user: receiver,
            grupo: group,
            status: Status.Pendiente,
        });

        return await this.groupInvitationRepository.save(newInvitation);
    }

    async acceptInvitation(invitationId: number, userId: String): Promise<void> {
        const invitation = await this.groupInvitationRepository.findOne({
            where: { id: invitationId },
            relations: ['grupo', 'user'],
        });

        if (!invitation) {
            throw new NotFoundException('Invitación no encontrada.');
        }

        if (invitation.status !== Status.Pendiente) {
            throw new HttpException("La invitacion ya ha sido procesada", HttpStatus.BAD_REQUEST)
        }

        if (userId !== invitation.user.id) {
            throw new HttpException("No estas autorizado para hacer esta accion", HttpStatus.UNAUTHORIZED)
        }

        invitation.status = Status.Aceptada;
        await this.groupInvitationRepository.save(invitation);

        try {
            await this.groupService.addUserToGroup(invitation.grupo.id, invitation.user);
        } catch (error) {
            throw new HttpException("Error al intentar agregar el usuario al grupo", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async rejectInvitation(invitationId: number, userId: String): Promise<void> {
        const invitation = await this.groupInvitationRepository.findOne({
            where: { id: invitationId },
            relations: ['user']
        })

        if (!invitation) {
            throw new NotFoundException('Invitación no encontrada.');
        }

        if (userId !== invitation.user.id) {
            throw new HttpException("No estas autorizado para hacer esta accion", HttpStatus.UNAUTHORIZED)
        }

        await this.groupInvitationRepository.remove(invitation);
    }

    async findUserInvitations(userId: String): Promise<InvitacionesGrupos[]> {
        const user = await this.usersService.findOneUser(userId)
        return await this.groupInvitationRepository.find({
            where: { user: user },
            relations: ['grupo'],
        })
    }
}
