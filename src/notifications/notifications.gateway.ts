import { BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CORS } from 'src/config/constants/cors';

@WebSocketGateway({
  cors: CORS,
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  private logger = new Logger(NotificationsGateway.name);
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log(' WebSocket Gateway inicializado');
    this.server = server;

    this.server.use((socket: Socket, next) => {
      let token =
        socket.handshake.query.token || socket.handshake.headers.authorization;

      token = Array.isArray(token) ? token[0] : token;

      if (!token) {
        return next(new Error('Unauthorized: token missing'));
      }

      try {
        const user = this.jwtService.verify(token.replace('Bearer ', ''));
        if(!user.id) {
          return next(new Error('Unauthorized: invalid token'));
        }
        
        socket.data.user = user;
        next();
      } catch {
        return next(new Error('Unauthorized: invalid token'));
      }
    });
  }

  handleConnection(client: Socket) {
    const user = client.data.user;
    const userId = user.id;

    // guardar socket
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }

    this.userSockets.get(userId)!.add(client.id);

    this.logger.log(`User ${userId} connected with socket ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.id;
    if (!userId) return;

    const sockets = this.userSockets.get(userId);
    if (!sockets) return;

    sockets.delete(client.id);

    if (sockets.size === 0) {
      this.userSockets.delete(userId);
    }

    this.logger.log(`User ${userId} disconnected socket ${client.id}`);
  }


  handleSendNotification(userId: string, notification: any) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) {
      this.logger.log(`User ${userId} is not connected. Notification not sent.`);
      return;
    }

    

    sockets.forEach((socketId) => {
      this.server.to(socketId).emit('notification', notification);
      this.logger.log(`Sent notification to user ${userId} on socket ${socketId}`);


    });
  }
}
