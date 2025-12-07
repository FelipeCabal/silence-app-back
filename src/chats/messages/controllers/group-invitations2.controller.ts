import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Request,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GroupInvitationsService } from '../services/group-invitations.service2';

@Controller('group-invitations')
@ApiTags('Group Invitations')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class InvitationsGroupController {
  constructor(
    private readonly groupInvitationsService: GroupInvitationsService,
  ) {}

  @ApiResponse({
    status: 201,
    description: 'Invitación creada correctamente',
    schema: {
      example: {
        _id: '6927b6e7095fa94953140567',
        user: {
          _id: '691d579dd871d869fdc986e4',
          nombre: 'Leopoldo',
          imagen:
            'https://storage.googleapis.com/gossipweb-37abf.appspot.com/profiles/691d579dd871d869fdc986e4/1763606019805_upload_1763606016852.jpg',
        },
        group: {
          _id: '691c0b947b21eb32451b3894',
          nombre: 'Grupo Prueba',
          imagen: 'string',
        },
        status: 'P',
        createdAt: '2025-11-27T02:26:47.625Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos en la solicitud' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - token faltante o inválido',
  })
  @Post(':groupId/send/:receiverId')
  @ApiOperation({ summary: 'Create a group invitation' })
  @ApiParam({ name: 'groupId', description: 'ID of the group' })
  @ApiParam({ name: 'receiverId', description: 'ID of the user to invite' })
  async createInvitation(
    @Param('groupId') groupId: string,
    @Param('receiverId') receiverId: string,
    @Request() req: any,
  ): Promise<any> {
    const senderId = req.user._id;
    return this.groupInvitationsService.create({
      senderId,
      receiverId,
      groupId,
    });
  }

  @Get('group/:groupId/pending')
  @ApiOperation({ summary: 'Obtener lista de usuarios con invitaciones pendientes para el grupo' })
  @ApiParam({ name: 'groupId', description: 'ID del grupo' })
  @ApiResponse({
    status: 200,
    description: 'Invitaciones pendientes obtenidas correctamente',
    schema: {
      example: {
        err: false,
        msg: 'Invitaciones pendientes obtenidas correctamente',
        data: [
          {
            _id: '692cb4547794f827ad9bf549',
            nombre: 'esteban',
            imagen: null
          }
        ]
      }
    }
  })
  async getPendingInvitations(
    @Param('groupId') groupId: string,
    @Request() req: any
  ) {
    const data = await this.groupInvitationsService.getPendingInvitationsByGroup(
      groupId,
      req.user._id
    );
    return {
      err: false,
      msg: 'Invitaciones pendientes obtenidas correctamente',
      data
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all invitations for the authenticated user' })
  @ApiResponse({ status: 404, description: 'No invitations found.' })
  async getUserInvitations(@Request() req: any): Promise<any[]> {
    const userId = req.user._id;
    const invitations = await this.groupInvitationsService.findByUser(userId);

    if (invitations.length === 0) {
      throw new NotFoundException(`No invitations found for user ${userId}`);
    }

    return invitations;
  }

  @Post(':invitationId/accept')
  @ApiOperation({ summary: 'Accept a group invitation' })
  @ApiParam({
    name: 'invitationId',
    description: 'ID of the invitation to accept',
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation accepted successfully.',
  })
  async acceptInvitation(
    @Param('invitationId') invitationId: string,
    @Request() req: any,
  ): Promise<any> {
    const userId = req.user._id;
    return this.groupInvitationsService.accept(invitationId, userId);
  }

  @Delete(':invitationId/reject')
  @ApiOperation({ summary: 'Reject a group invitation' })
  @ApiParam({
    name: 'invitationId',
    description: 'ID of the invitation to reject',
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation rejected successfully.',
  })
  async rejectInvitation(
    @Param('invitationId') invitationId: string,
    @Request() req: any,
  ): Promise<void> {
    const userId = req.user._id;
    await this.groupInvitationsService.reject(invitationId, userId);
  }

  @ApiResponse({
    status: 200,
    description: 'Invitación encontrada correctamente',
    schema: {
      example: {
        _id: '691c0d9d7b21eb32451b38a4',
        user: {
          _id: '691bfb8d2e5f2fe2ab3bd065',
          nombre: 'Andres',
          imagen: null,
        },
        group: {
          _id: '691c0b947b21eb32451b3894',
          nombre: 'Grupo Prueba',
          imagen: 'string',
        },
        status: 'A',
        createdAt: '2025-11-18T06:09:33.314Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Invitación no encontrada' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - token faltante o inválido',
  })
  @Get(':invitationId')
  @ApiOperation({ summary: 'Get a specific invitation by ID' })
  @ApiParam({
    name: 'invitationId',
    description: 'ID of the invitation to retrieve',
  })
  @ApiResponse({ status: 404, description: 'Invitation not found.' })
  async findOne(@Param('invitationId') invitationId: string): Promise<any> {
    const invitation = await this.groupInvitationsService.findOne(invitationId);

    if (!invitation) {
      throw new NotFoundException(
        `Invitation with ID ${invitationId} not found`,
      );
    }

    return invitation;
  }
}
