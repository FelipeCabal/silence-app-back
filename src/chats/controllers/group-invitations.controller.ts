import { Controller, Delete, Get, Param, ParseIntPipe, Post, Request, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { GroupInvitationsService } from "../services/group-invitations.service";

@Controller('group-invitation')
@ApiTags('invitation-group')
@UseGuards(AuthGuard)
export class InvitationsGroupController {
    constructor(private readonly groupInvitationsService: GroupInvitationsService) { }

    @Post(':groupId/send/:receiverId')
    @ApiOperation({ summary: 'Create a group invitation' })
    async createInvitation(
        @Param('groupId', ParseIntPipe) groupId: number,
        @Param('receiverId', ParseIntPipe) receiverId: string,
        @Request() req: any
    ) {
        const senderId = req.user._id;
        return await this.groupInvitationsService.createInvitation(
            senderId,
            receiverId,
            groupId,
        )
    }

    @Get()
    @ApiOperation({ summary: 'Get all invitations for the authenticated user' })
    async getUserInvitations(@Request() req: any) {
        const userId = req.user._id
        return await this.groupInvitationsService.findUserInvitations(userId)
    }

    @Post(':invitationId/accept')
    @ApiOperation({ summary: 'Accept a group invitation' })
    async acceptInvitation(
        @Param('invitationId', ParseIntPipe) invitationId: number,
        @Request() req: any
    ): Promise<void> {
        const userId = req.user._id
        await this.groupInvitationsService.acceptInvitation(invitationId, userId);
    }

    @Delete(':invitationId/reject')
    @ApiOperation({ summary: 'Reject a group invitation' })
    async rejectInvitation(
        @Param('invitationId', ParseIntPipe) invitationId: number,
        @Request() req: any
    ): Promise<void> {
        const userId = req.user._id
        await this.groupInvitationsService.rejectInvitation(invitationId, userId);
    }

}