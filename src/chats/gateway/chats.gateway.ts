import { WebSocketGateway, SubscribeMessage, ConnectedSocket, OnGatewayInit, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from '../messages/services/mensajes.service';

@WebSocketGateway({
    cors: { origin: '*' },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'], // Permitir el header `Authorization`
    transports: ['websocket'],
})
export class MessagesGateway implements OnGatewayInit {
    private server: Server;

    constructor(
        private readonly messagesService: MessagesService,
        private readonly jwtService: JwtService
    ) { }

    afterInit(server: Server) {
        this.server = server;

        this.server.use((socket, next) => {
            let token = socket.handshake.query.token || socket.handshake.headers.authorization

            token = Array.isArray(token) ? token[0] : token;
            console.log(token)
            console.log(socket.handshake)
            try {
                const user = this.jwtService.verify(token.replace('Bearer ', ''));
                socket.data.user = user;
                next();
            } catch (err) {
                next(new Error('Unauthorized'));
            }
        });
    }
    handleConnection(client: any) {
        console.log('Headers del cliente:', client.handshake.headers);
    }

    @SubscribeMessage('joinChat')
    handleJoinChat(
        @MessageBody() { chatId, chatType }: { chatId: string, chatType: string },
        @ConnectedSocket() client: Socket
    ): void {
        const roomName = `${chatType}:${chatId}`;

        client.join(roomName);

        console.log(`Usuario ${client.data.user.id} se unió al chat ${roomName}`);
    }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @MessageBody() createMessageDto: { chatId: number; chatType: string; message: string },
        @ConnectedSocket() client: Socket
    ): Promise<void> {
        const user = client.data.user;
        const message = await this.messagesService.createMessage({
            usuarioId: user.id,
            message: createMessageDto.message,
            chatId: createMessageDto.chatId,
            chatType: createMessageDto.chatType,
        });

        this.server.to(`${createMessageDto.chatType}:${createMessageDto.chatId}`).emit('messageReceived', message);
        console.log('Mensaje enviado:', message);
    }
}
