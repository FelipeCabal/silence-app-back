import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';
import { NotificationType } from '../models/notification.model';
import { PublicacionResponseDto } from 'src/publicaciones/dto/responses/publicacion-response.dto';
import { User } from 'src/users/entities/user.model';


export class PostEventPayload {
  post: PublicacionResponseDto;
  sender: User
}

@Injectable()
export class PostListener {
  private readonly logger = new Logger(PostListener.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('post.liked')
  handlePostLikedEvent(payload: PostEventPayload) {
    this.logger.log(`Post liked event received for postId: ${payload.post.id}, userId: ${payload.sender._id}`);
  }

  @OnEvent('post.commented')
  handlePostCommentedEvent(payload: PostEventPayload) {
    this.logger.log(`Post commented event received for postId: ${payload.post.id}, userId: ${payload.sender._id}`);

    this.notificationsService.createNotification({
      type: NotificationType.COMMENT,
      message: `${payload.sender.nombre} comentó en tu publicación.`,
      receiver: payload.post.owner,
      sender: payload.sender,
    })
  }
}
