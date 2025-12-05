import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationModel } from './models/notification.model';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UserSchema } from 'src/users/entities/users.schema';
import { RedisService } from 'src/redis/redis.service';


@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(NotificationModel.name)
    private notificationModel: Model<NotificationModel>,
    private notificationsGateway: NotificationsGateway,
    @InjectModel(UserSchema.name)
    private usersModel: Model<UserSchema>,
    private readonly redisService: RedisService,
  ) {}

  private readonly TTL_NOTIFICATIONS = 300; // 5 minutos

  /**
   * Creates a new notification and saves it to the database.
   * After saving, sends a real-time notification to the receiver if they are connected.
   *
   * @param {CreateNotificationDto} param0 - The notification data including message, receiver, sender, and type.
   * @returns {Promise<void>} Resolves when the notification is created and sent.
   */
  async createNotification({message, receiver, sender, type}: CreateNotificationDto) {    
    const notification = new this.notificationModel({
      message: message,
      receiver: receiver,
      sender: sender,
      type: type,
    });

    await notification.save();

    // Invalidar caché de notificaciones del receptor
    try {
      await this.redisService.client.del(`notifications:user:${receiver._id}`);
    } catch (err) {
      console.warn('Redis no disponible para invalidar caché de notificaciones:', err.message);
    }

    // Enviar notificación en tiempo real si el usuario está conectado
    this.notificationsGateway.handleSendNotification(
      receiver._id.toString(),
      notification.toObject(),
    );
  }

  /**
   * Retrieves notifications for a specific user, sorted by creation date (descending) and read status.
   *
   * @param userId - The unique identifier of the user whose notifications are to be fetched.
   * @returns A promise that resolves to an array of notification objects for the specified user.
   */
  async getNotificationsForUser(userId: string) {
    const cacheKey = `notifications:user:${userId}`;

    // Intentar obtener del caché
    try {
      const cached = await this.redisService.client.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.warn('Redis no disponible para obtener caché de notificaciones:', err.message);
    }

    // Si no está en caché, consultar base de datos
    const notifications = await this.notificationModel
      .find({ 'receiver._id': userId })
      .sort({ createdAt: -1, read: 1 })
      .exec();

    const result = notifications.map((notification) => notification.toObject());

    // Guardar en caché
    try {
      await this.redisService.client.set(
        cacheKey,
        JSON.stringify(result),
        'EX',
        this.TTL_NOTIFICATIONS,
      );
    } catch (err) {
      console.warn('Redis no disponible para guardar caché de notificaciones:', err.message);
    }

    return result;
  }

  /**
   * Marks a specific notification as read.
   *
   * @param notificationId - The unique identifier of the notification to be marked as read.
   * @returns A promise that resolves to the updated notification object.
   */
  async markAsRead(userId:string, notificationId: string) {
    const notification = await this.notificationModel.findById(notificationId);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if(notification.receiver._id.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to mark this notification as read');
    }

    const updated = await this.notificationModel.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true },
    );

    // Invalidar caché de notificaciones del usuario
    try {
      await this.redisService.client.del(`notifications:user:${userId}`);
    } catch (err) {
      console.warn('Redis no disponible para invalidar caché de notificaciones:', err.message);
    }

    return updated;
  }

  async deleteNotification(notificationId: string) {
    const notification = await this.notificationModel.findById(notificationId);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const userId = notification.receiver._id.toString();

    await this.notificationModel.findByIdAndDelete(notificationId);

    // Invalidar caché de notificaciones del usuario
    try {
      await this.redisService.client.del(`notifications:user:${userId}`);
    } catch (err) {
      console.warn('Redis no disponible para invalidar caché de notificaciones:', err.message);
    }
  }
}
