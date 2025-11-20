import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GroupInvitationsService } from '../messages/services/group-invitations.service2';
import { CreateInvitationDto } from '../dto/invitation/request/CreateInvitationDto';

@Controller('group-invitation')
@ApiTags('invitation-group')
@UseGuards(AuthGuard)
export class InvitationsGroupController {
  constructor(
    private readonly groupInvitationsService: GroupInvitationsService,
  ) {}

  @Post('send/')
  @ApiOperation({ summary: 'Create a group invitation' })
  async createInvitation(
    @Body() body: CreateInvitationDto,
    @Request() req: any,
  ) {
    const senderId = req.user.id;
    return await this.groupInvitationsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invitations for the authenticated user' })
  async getUserInvitations(@Request() req: any) {
    const userId = req.user.id;
    return await this.groupInvitationsService.findByUser(userId);
  }

  @Post(':invitationId/accept')
  @ApiOperation({ summary: 'Accept a group invitation' })
  async acceptInvitation(
    @Param('invitationId') invitationId: string,
    @Request() req: any,
  ): Promise<void> {
    const userId = req.user.id;
    await this.groupInvitationsService.accept(invitationId, userId);
  }

  @Delete(':invitationId/reject')
  @ApiOperation({ summary: 'Reject a group invitation' })
  async rejectInvitation(
    @Param('invitationId') invitationId: string,
    @Request() req: any,
  ): Promise<void> {
    const userId = req.user.id;
    await this.groupInvitationsService.reject(invitationId, userId);
  }
}
