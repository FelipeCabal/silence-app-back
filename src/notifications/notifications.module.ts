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
import { NotificationsController } from './controllers/notifications.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersService } from 'src/users/services/users.service';
import { UsersModule } from 'src/users/users.module';

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

    AuthModule,
    UsersModule
  ],
  providers: [NotificationsService, NotificationsGateway, PostListener],
  controllers: [
    NotificationsController
  ],
  exports: [],
})
export class NotificationsModule {}
