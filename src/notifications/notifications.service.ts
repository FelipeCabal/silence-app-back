import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationModel } from './models/notification.model';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UserSchema } from 'src/users/entities/users.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(NotificationModel.name)
    private notificationModel: Model<NotificationModel>,
    private notificationsGateway: NotificationsGateway,
    @InjectModel(UserSchema.name)
    private usersModel: Model<UserSchema>,
  ) {}

  async createNotification({message, receiver, sender, type}: CreateNotificationDto) {
    
    const notification = new this.notificationModel({
      message: message,
      receiver: receiver,
      sender: sender,
      type: type,
    });

    await notification.save();

    // Enviar notificación en tiempo real si el usuario está conectado
    this.notificationsGateway.handleSendNotification(
      receiver._id.toString(),
      notification.toObject(),
    );
  }
}
