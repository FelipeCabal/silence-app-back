import { forwardRef, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatPrivado } from '../entities/chats.entity';
import { Repository } from 'typeorm';
import { SolicitudesAmistadService } from 'src/users/services/solicitudesAmistad.service';
import { UsersService } from 'src/users/services/users.service';
import { ComunityAndGroupQueries } from '../dto/queries/comunities-queries.dto';


@Injectable()
export class PrivateChatsService {
    constructor(

        @Inject(forwardRef(() => SolicitudesAmistadService))
        private readonly solicitudAmistadServices: SolicitudesAmistadService,

        @Inject(forwardRef(() => UsersService))
        private readonly usersServices: UsersService,

        @InjectRepository(ChatPrivado)
        private readonly privateChatsRepository: Repository<ChatPrivado>

    ) { }

    async create(amistadId: number): Promise<ChatPrivado> {
        try {
            const solicitud = await this.solicitudAmistadServices.findOneReq(amistadId);

            if (!solicitud) {
                throw new HttpException(
                    `SolicitudAmistad con ID ${amistadId} no encontrada.`,
                    HttpStatus.NOT_FOUND,
                );
            }

            const newChat = this.privateChatsRepository.create({
                amistad: solicitud
            });

            return await this.privateChatsRepository.save(newChat);
        } catch (error) {
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAllUserChats(userId: number, ChatQueries: ComunityAndGroupQueries): Promise<any[]> {
        const friendships = await this.usersServices.findAllFriends(userId);

        if (!friendships || friendships.length === 0) {
            throw new NotFoundException('El usuario no tiene amigos con chats privados.');
        }

        const friendshipIds = friendships.map((friendship) => friendship.solicitudId.id);

        let privateChats = await this.privateChatsRepository
            .createQueryBuilder('privateChat')
            .leftJoinAndSelect('privateChat.amistad', 'amistad')
            .leftJoinAndSelect('amistad.userEnvia', 'userEnvia')
            .leftJoinAndSelect('amistad.userRecibe', 'userRecibe')
            .where('privateChat.amistad.id IN (:...friendshipIds)', { friendshipIds })
            .getMany();


        let chatsList = friendships.flatMap((friendship) => {
            return privateChats
                .filter((chat) => chat.amistad.id === friendship.solicitudId.id)
                .map((chat) => {

                    return {
                        id: chat.id,
                        createdAt: chat.createAt,
                        friendName: friendship.user.nombre,
                        friend: friendship.user,
                    };
                });
        });

        if (ChatQueries.search) {
            chatsList = chatsList.filter((chat) =>
                chat.friendName.toLowerCase().includes(ChatQueries.search.toLowerCase())
            );
        }

        chatsList = chatsList.sort((a, b) => a.friendName.localeCompare(b.friendName));

        if (ChatQueries.limit && Number.isInteger(ChatQueries.limit)) {
            chatsList = chatsList.slice(0, ChatQueries.limit);
        }

        if (chatsList.length === 0) {
            throw new HttpException('No se encontraron chats privados para este usuario.', HttpStatus.NOT_FOUND);
        }

        return chatsList;
    }


    async findOne(id: number): Promise<ChatPrivado> {
        try {
            const chat = await this.privateChatsRepository.findOne({
                where: { id },
                relations: [
                    'amistad',
                    'amistad.userEnvia',
                    'amistad.userRecibe'
                ]
            });

            if (!chat) {
                throw new HttpException(
                    `ChatPrivado con ID ${id} no encontrado.`,
                    HttpStatus.NOT_FOUND
                );
            }

            return chat;
        } catch (error) {
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async remove(id: number): Promise<void> {
        try {
            const chat = await this.findOne(id)

            if (!chat) {
                throw new HttpException(
                    `ChatPrivado con ID ${id} no encontrado.`,
                    HttpStatus.NOT_FOUND,
                );
            }

            await this.privateChatsRepository.remove(chat);
        } catch (error) {
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
