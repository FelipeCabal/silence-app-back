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
import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatPrivateService } from '../chat-private/chat-private.service';
import { GroupService } from '../groups/groups.service';
import { CommunityService } from '../comunity/community.service';
import { ChatAuthorizationService } from '../services/chat-authorization.service';
import { SendMessageDto, JoinChatDto, TypingDto, ChatType } from '../dto/message.dto';
import { CORS } from 'src/config/constants/cors';
import { Types } from 'mongoose';

@WebSocketGateway({
  cors: CORS,
  namespace: '/chats',
  transports: ['websocket'],
})
@UsePipes(new ValidationPipe({ transform: true }))
export class ChatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(ChatsGateway.name);
  
  // Mapa de usuarios conectados: userId -> Set<socketId>
  private userSockets: Map<string, Set<string>> = new Map();
  
  // Mapa de salas: roomName -> Set<userId>
  private roomUsers: Map<string, Set<string>> = new Map();

  constructor(
    private readonly chatPrivateService: ChatPrivateService,
    private readonly groupService: GroupService,
    private readonly communityService: CommunityService,
    private readonly chatAuthService: ChatAuthorizationService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('🚀 WebSocket Chat Gateway inicializado');
    this.server = server;

    // Middleware de autenticación
    this.server.use((socket: Socket, next) => {
      try {
        let token =
          socket.handshake.query.token || socket.handshake.headers.authorization;

        token = Array.isArray(token) ? token[0] : token;
        
        if (!token) {
          return next(new Error('Unauthorized: token missing'));
        }

        const user = this.jwtService.verify(token.replace('Bearer ', ''));
        
        if (!user.id) {
          return next(new Error('Unauthorized: invalid token'));
        }

        socket.data.user = user;
        next();
      } catch (err) {
        this.logger.warn(`⚠️ Conexión rechazada: ${err.message}`);
        next(new Error('Unauthorized: invalid token'));
      }
    });
  }

  handleConnection(client: Socket) {
    const user = client.data.user;
    const userId = user?.id;

    if (!userId) {
      this.logger.warn('⚠️ Usuario sin ID intentó conectarse');
      client.disconnect(true);
      return;
    }

    // Registrar socket del usuario
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);

    this.logger.log(`✅ Usuario ${userId} conectado (socket: ${client.id})`);
    
    // Notificar al usuario sobre su conexión exitosa
    client.emit('connected', { 
      userId, 
      socketId: client.id,
      timestamp: new Date().toISOString() 
    });
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.id;
    
    if (!userId) return;

    // Remover socket del usuario
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }

    // Remover usuario de todas las salas
    this.roomUsers.forEach((users, roomName) => {
      if (users.has(userId)) {
        users.delete(userId);
        // Notificar a otros en la sala
        client.to(roomName).emit('userLeft', { userId, roomName });
      }
    });

    this.logger.log(`❌ Usuario ${userId} desconectado (socket: ${client.id})`);
  }

  /**
   * Unirse a una sala de chat
   */
  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() data: JoinChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.id;
    const { chatId, chatType } = data;

    try {
      // Verificar acceso
      await this.chatAuthService.verifyAccess(chatId, userId, chatType);

      const roomName = this.getRoomName(chatId, chatType);
      
      // Unirse a la sala
      client.join(roomName);

      // Registrar usuario en la sala
      if (!this.roomUsers.has(roomName)) {
        this.roomUsers.set(roomName, new Set());
      }
      this.roomUsers.get(roomName)!.add(userId);

      this.logger.log(`📥 Usuario ${userId} se unió a ${roomName}`);

      // Notificar al cliente
      client.emit('joinedChat', {
        chatId,
        chatType,
        roomName,
        timestamp: new Date().toISOString(),
      });

      // Notificar a otros en la sala
      client.to(roomName).emit('userJoined', {
        userId,
        chatId,
        chatType,
        timestamp: new Date().toISOString(),
      });

      return { success: true, roomName };
    } catch (error) {
      this.logger.error(`❌ Error al unirse al chat: ${error.message}`);
      client.emit('error', {
        event: 'joinChat',
        message: error.message,
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Salir de una sala de chat
   */
  @SubscribeMessage('leaveChat')
  async handleLeaveChat(
    @MessageBody() data: JoinChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.id;
    const { chatId, chatType } = data;
    const roomName = this.getRoomName(chatId, chatType);

    client.leave(roomName);

    // Remover usuario de la sala
    const users = this.roomUsers.get(roomName);
    if (users) {
      users.delete(userId);
    }

    this.logger.log(`📤 Usuario ${userId} salió de ${roomName}`);

    // Notificar a otros
    client.to(roomName).emit('userLeft', {
      userId,
      chatId,
      chatType,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  /**
   * Enviar mensaje
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.id;
    const { chatId, message, chatType } = data;

    try {
      // Verificar acceso
      await this.chatAuthService.verifyAccess(chatId, userId, chatType);

      let savedMessage: any;

      // Guardar mensaje según el tipo de chat
      switch (chatType) {
        case ChatType.PRIVATE:
          savedMessage = await this.chatPrivateService.addMessage(chatId, userId, message);
          break;
        case ChatType.GROUP:
          savedMessage = await this.groupService.addMessage(chatId, userId, message);
          break;
        case ChatType.COMMUNITY:
          savedMessage = await this.communityService.addMessage(chatId, userId, message);
          break;
      }

      const roomName = this.getRoomName(chatId, chatType);

      // Emitir mensaje a todos en la sala (incluido el emisor)
      this.server.to(roomName).emit('messageReceived', {
        chatId,
        chatType,
        message: savedMessage,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`💬 Mensaje enviado en ${roomName} por ${userId}`);

      return { success: true, message: savedMessage };
    } catch (error) {
      this.logger.error(`❌ Error al enviar mensaje: ${error.message}`);
      client.emit('error', {
        event: 'sendMessage',
        message: error.message,
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Indicador de escritura
   */
  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: TypingDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.id;
    const { chatId, chatType, isTyping = true } = data;

    try {
      await this.chatAuthService.verifyAccess(chatId, userId, chatType);

      const roomName = this.getRoomName(chatId, chatType);

      // Emitir solo a otros (no al emisor)
      client.to(roomName).emit('userTyping', {
        userId,
        chatId,
        chatType,
        isTyping,
        timestamp: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Marcar mensajes como leídos
   */
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { chatId: string; chatType: ChatType; messageIds?: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.id;
    const { chatId, chatType, messageIds } = data;

    try {
      await this.chatAuthService.verifyAccess(chatId, userId, chatType);

      const roomName = this.getRoomName(chatId, chatType);

      // Notificar a otros usuarios
      client.to(roomName).emit('messagesRead', {
        userId,
        chatId,
        chatType,
        messageIds,
        timestamp: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener usuarios activos en un chat
   */
  @SubscribeMessage('getActiveUsers')
  async handleGetActiveUsers(
    @MessageBody() data: JoinChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { chatId, chatType } = data;
    const roomName = this.getRoomName(chatId, chatType);
    const activeUsers = Array.from(this.roomUsers.get(roomName) || []);

    return { success: true, activeUsers, count: activeUsers.length };
  }

  /**
   * Construye el nombre de la sala según el tipo de chat
   */
  private getRoomName(chatId: string, chatType: ChatType): string {
    return `${chatType}:${chatId}`;
  }

  /**
   * Método público para enviar mensajes desde otros servicios
   */
  public emitToChat(chatId: string, chatType: ChatType, event: string, data: any) {
    const roomName = this.getRoomName(chatId, chatType);
    this.server.to(roomName).emit(event, data);
    this.logger.log(`📡 Evento '${event}' emitido a ${roomName}`);
  }

  /**
   * Enviar notificación a usuarios específicos
   */
  public emitToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach((userId) => {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.forEach((socketId) => {
          this.server.to(socketId).emit(event, data);
        });
      }
    });
  }
}
