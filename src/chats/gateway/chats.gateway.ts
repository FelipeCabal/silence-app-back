import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayInit,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, Logger } from '@nestjs/common';
import { ChatPrivateService } from '../chat-private/chat-private.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
  },
  transports: ['websocket'],
})
export class MessagesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(
    private readonly chatPrivateService: ChatPrivateService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    this.logger.log(' WebSocket Gateway inicializado');
    this.server = server;

    this.server.use((socket: Socket, next) => {
      try {
        let token =
          socket.handshake.query.token || socket.handshake.headers.authorization;

        token = Array.isArray(token) ? token[0] : token;
        if (!token) throw new Error('Token no proporcionado');

        const user = this.jwtService.verify(token.replace('Bearer ', ''));
        socket.data.user = user; 
        next();
      } catch (err) {
        this.logger.warn(` Conexión rechazada: ${err.message}`);
        next(new Error('Unauthorized'));
      }
    });
  }

  handleConnection(client: Socket) {
    const user = client.data.user;
    if (user) {
      this.logger.log(`Usuario conectado: ${user.id}`);
    } else {
      this.logger.warn('Usuario desconocido intentó conectarse');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      this.logger.log(` Usuario desconectado: ${user.id}`);
    }
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() { chatId }: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.id;
    const chat = await this.chatPrivateService.findById(chatId, userId);

    if (
      chat.amistad.usuario1._id.toString() !== userId &&
      chat.amistad.usuario2._id.toString() !== userId
    ) {
      throw new ForbiddenException('No tienes acceso a este chat');
    }

    const roomName = `private:${chatId}`;
    client.join(roomName);
    this.logger.log(` Usuario ${userId} se unió a la sala ${roomName}`);

    client.to(roomName).emit('userJoined', {
      userId,
      message: 'Un usuario se unió al chat',
    });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    body: { chatId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.id;

    const message = await this.chatPrivateService.addMessage(
      body.chatId,
      userId,
      body.message,
    );

    const roomName = `private:${body.chatId}`;

    this.server.to(roomName).emit('messageReceived', {
      chatId: body.chatId,
      message,
    });

    this.logger.log(
      ` Mensaje enviado por ${userId} en ${roomName}: ${body.message}`,
    );
  }
}
