import { User } from "src/users/entities/user.model";
import { NotificationType } from "../models/notification.model";

export class CreateNotificationDto {
    message: string;
    sender: User;
    receiver: User;
    type: NotificationType;
}