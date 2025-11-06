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
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GroupInvitationsService } from '../services/group-invitations.service2';
import { InvitacionGrupoResponseDto } from '../dto/invitation/response/InvitacionGrupoResponseDto';

@Controller('group-invitations')
@ApiTags('Group Invitations')
@UseGuards(AuthGuard)
export class InvitationsGroupController {
  constructor(
    private readonly groupInvitationsService: GroupInvitationsService,
  ) {}

  @Post(':groupId/send/:receiverId')
  @ApiOperation({ summary: 'Create a group invitation' })
  @ApiParam({ name: 'groupId', description: 'ID of the group' })
  @ApiParam({ name: 'receiverId', description: 'ID of the user to invite' })
  @ApiResponse({
    status: 201,
    type: InvitacionGrupoResponseDto,
    description: 'The invitation has been successfully created.',
  })
  async createInvitation(
    @Param('groupId') groupId: string,
    @Param('receiverId') receiverId: string,
    @Request() req: any,
  ): Promise<InvitacionGrupoResponseDto> {
    const senderId = req.user.id;
    return this.groupInvitationsService.create({
      senderId,
      receiverId,
      groupId,
    });
  }


  @Get()
  @ApiOperation({ summary: 'Get all invitations for the authenticated user' })
  @ApiResponse({
    status: 200,
    type: [InvitacionGrupoResponseDto],
    description: 'List of invitations for the user.',
  })
  @ApiResponse({ status: 404, description: 'No invitations found.' })
  async getUserInvitations(@Request() req: any): Promise<InvitacionGrupoResponseDto[]> {
    const userId = req.user.id;
    const invitations = await this.groupInvitationsService.findByUser(userId);

    if (invitations.length === 0) {
      throw new NotFoundException(`No invitations found for user ${userId}`);
    }

    return invitations;
  }

  @Post(':invitationId/accept')
  @ApiOperation({ summary: 'Accept a group invitation' })
  @ApiParam({ name: 'invitationId', description: 'ID of the invitation to accept' })
  @ApiResponse({ status: 200, description: 'Invitation accepted successfully.' })
  async acceptInvitation(
    @Param('invitationId') invitationId: string,
    @Request() req: any,
  ): Promise<InvitacionGrupoResponseDto> {
    const userId = req.user.id;
    return this.groupInvitationsService.accept(invitationId, userId);
  }


  @Delete(':invitationId/reject')
  @ApiOperation({ summary: 'Reject a group invitation' })
  @ApiParam({ name: 'invitationId', description: 'ID of the invitation to reject' })
  @ApiResponse({ status: 200, description: 'Invitation rejected successfully.' })
  async rejectInvitation(
    @Param('invitationId') invitationId: string,
    @Request() req: any,
  ): Promise<void> {
    const userId = req.user.id;
    await this.groupInvitationsService.reject(invitationId, userId);
  }


  @Get(':invitationId')
  @ApiOperation({ summary: 'Get a specific invitation by ID' })
  @ApiParam({ name: 'invitationId', description: 'ID of the invitation to retrieve' })
  @ApiResponse({
    status: 200,
    type: InvitacionGrupoResponseDto,
    description: 'The invitation has been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'Invitation not found.' })
  async findOne(@Param('invitationId') invitationId: string): Promise<InvitacionGrupoResponseDto> {
    const invitation = await this.groupInvitationsService.findOne(invitationId);

    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${invitationId} not found`);
    }

    return invitation;
  }
}
