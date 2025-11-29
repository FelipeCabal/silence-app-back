import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import {
  NotificationModel,
  NotificationSchema,
} from './models/notification.model';
import { userModelSchema, UserSchema } from 'src/users/entities/users.schema';
import { PostListener } from './listeners/post.listener';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: NotificationModel.name,
        schema: NotificationSchema,
      },
      {
        name: UserSchema.name,
        schema: userModelSchema,
      },
    ]),
  ],
  providers: [NotificationsService, NotificationsGateway, PostListener],
})
export class NotificationsModule {}
