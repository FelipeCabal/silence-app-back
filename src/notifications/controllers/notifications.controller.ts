import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Request,
  UseGuards,
  Header,
} from '@nestjs/common';
import { NotificationsService } from '../notifications.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  @Header('Surrogate-Control', 'no-store')
  @ApiOperation({ summary: 'Get user notifications', description: 'Retrieve notifications for the authenticated user, sorted by creation date and read status.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of notifications retrieved successfully.' })
  findForUser(@Request() req: any) {
    return this.notificationsService.getNotificationsForUser(req.user._id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read', description: 'Mark a specific notification as read for the authenticated user.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification marked as read successfully.' })
  @ApiParam({ name: 'id', description: 'The ID of the notification to mark as read.' })
  markAsRead(@Param('id') notificationId: string, @Request() req: any) {
    return this.notificationsService.markAsRead(req.user._id, notificationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete notification', description: 'Delete a specific notification by its ID.' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Notification deleted successfully.' })
  @ApiParam({ name: 'id', description: 'The ID of the notification to delete.' })
  deleteNotification(@Param('id') notificationId: string) {
    return this.notificationsService.deleteNotification(notificationId);
  }
}
