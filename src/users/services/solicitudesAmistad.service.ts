import { UsersService } from "./users.service";
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Status } from "src/config/enums/status.enum";
import { InjectModel } from "@nestjs/mongoose";
import { FriendRequest } from "../entities/solicitud.schema";
import { Model } from "mongoose";
import { UserSchema } from "../entities/users.schema";
import { RedisService } from "../../redis/redis.service";
import { ChatPrivateService } from "src/chats/chat-private/chat-private.service";

@Injectable()
export class SolicitudesAmistadService {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService,

        @InjectModel(UserSchema.name) private readonly userModel: Model<UserSchema>,

        @Inject(forwardRef(() => ChatPrivateService))
        private readonly privateChatsService: ChatPrivateService,

        @InjectModel(FriendRequest.name)
        private readonly requestModel: Model<FriendRequest>,

        private readonly redisService: RedisService,
    ) { }

    private readonly TTL_REQUEST_SECONDS = 600;

    private buildPairKey(user1Id: string, user2Id: string) {
        const [a, b] = [user1Id, user2Id].sort();
        return `friendreq:pair:${a}:${b}`;
    }

    private async cacheSet(key: string, value: any, ttl: number) {
        try {
            await this.redisService.client.set(key, JSON.stringify(value), 'EX', ttl);
        } catch { }
    }

    private async cacheGet<T = any>(key: string): Promise<T | null> {
        try {
            const raw = await this.redisService.client.get(key);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }

    private async invalidate(keys: string[]) {
        try {
            if (keys.length) await this.redisService.client.del(...keys);
        } catch { }
    }

    async sendFriendRequest(userSendId: string, userReceiveId: string) {
        const userSend = await this.usersService.findOneUser(userSendId);
        const userReceive = await this.usersService.findOneUser(userReceiveId);

        if (!userSend || !userReceive) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        if (userSend === userReceive) {
            throw new HttpException("You cann't to send request to yourself", HttpStatus.BAD_REQUEST);
        }

        const requestExistitng = await this.requestModel.findOne({
            where: [
                { userEnvia: userSend, userRecibe: userReceive, status: Status.Pendiente },
                { userEnvia: userReceive, userRecibe: userSend, status: Status.Pendiente }
            ]
        });

        if (requestExistitng) {
            throw new HttpException("request already exists", HttpStatus.CONFLICT);
        }

        const friendRequest = new this.requestModel({
            userEnvia: userSend._id,
            userRecibe: userReceive._id,
            status: Status.Pendiente
        });

        await this.userModel.updateOne(
            { _id: userSendId },
            {
                $push: {
                    "solicitudesAmistad.0.enviadas": {
                        _id: friendRequest._id.toString(),
                        to: userReceiveId,
                        estado: "Pending",
                        fecha: new Date(),
                    }
                }
            }
        );

        await this.userModel.updateOne(
            { _id: userReceiveId },
            {
                $push: {
                    "solicitudesAmistad.0.recibidas": {
                        _id: friendRequest._id.toString(),
                        from: userSendId,
                        estado: "Pending",
                        fecha: new Date(),
                    }
                }
            }
        )

        const savedRequest = await friendRequest.save()

        await this.invalidate([
            `friendreq:received:${userReceiveId}`,
            `friendreq:user:${userSendId}`,
            `friendreq:user:${userReceiveId}`,
            this.buildPairKey(userSendId, userReceiveId),
        ]);

        await this.invalidate([`friendreq:req:${savedRequest._id.toString()}`]);
        return {
            ...savedRequest.toObject(),
            _id: savedRequest._id.toString()
        };
    }

    async findAllReceiveRequest(userId: string) {
        const exists = await this.usersService.userExists(userId);
        if (!exists) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }

        const cacheKey = `friendreq:received:${userId}`;
        const cached = await this.cacheGet<any[]>(cacheKey);
        if (cached) return cached;

        const requests = await this.requestModel
            .find({
                userRecibe: userId.toString(),
                status: Status.Pendiente
            })
            .populate({
                path: 'userEnvia',
                select: '_id nombre imagen descripcion email'
            })
            .select('_id userEnvia status createdAt')
            .lean()
            .exec();

        const result = requests.map(req => {
            const sender = req.userEnvia as any;

            return {
                id: req._id.toString(),
                status: req.status,
                sender: {
                    id: sender._id ? sender._id.toString() : sender.toString(),
                    nombre: sender.nombre || '',
                    imagen: sender.imagen || null,
                    descripcion: sender.descripcion || '',
                    email: sender.email || ''
                }
            };
        });
        this.cacheSet(cacheKey, result, this.TTL_REQUEST_SECONDS);
        return result;
    }

    async findOneReq(requestId: string) {
        const cacheKey = `friendreq:req:${requestId}`;
        const cached = await this.cacheGet<any>(cacheKey);
        if (cached) return cached;

        const req = await this.requestModel
            .findById(requestId)
            .populate('userEnvia', 'nombre imagen email descripcion')
            .populate('userRecibe', 'nombre imagen email descripcion')
            .lean()
            .exec();

        if (req) {
            this.cacheSet(cacheKey, req, this.TTL_REQUEST_SECONDS);
        }
        return req as any;
    }

    async updateRequest(requestId: string, userId: string, newStatus: Status) {

        const request = await this.findOneReq(requestId);

        if (!request) {
            throw new HttpException('Request not found', HttpStatus.NOT_FOUND);
        }

        if (request.status !== Status.Pendiente) {
            throw new HttpException(
                'Request has already been processed',
                HttpStatus.BAD_REQUEST
            );
        }

        if (request.userRecibe._id.toString() !== userId) {
            throw new HttpException("You're not authorized", HttpStatus.UNAUTHORIZED);
        }

        console.log('newStatus recibido:', newStatus);
        console.log('Enum Status:', Status);

        if (newStatus !== Status.Aceptada && newStatus != Status.Rechazada) {
            throw new HttpException('Status must be A (Accepted) or R (Rejected)', HttpStatus.BAD_REQUEST
            );
        }

        const senderId = request.userEnvia._id.toString();
        const receiverId = request.userRecibe._id.toString();

        try {
            const updatedRequest = await this.requestModel.findByIdAndUpdate(
                requestId,
                { status: newStatus },
                { new: true }
            );

            await this.userModel.updateOne(
                { _id: senderId, 'solicitudesAmistad.enviadas._id': requestId },
                {
                    $set: {
                        'solicitudesAmistad.$[].enviadas.$[elem].estado': newStatus,
                        'solicitudesAmistad.$[].enviadas.$[elem].fecha': new Date()
                    }
                },
                { arrayFilters: [{ 'elem._id': requestId }] }
            );

            await this.userModel.updateOne(
                { _id: receiverId, 'solicitudesAmistad.recibidas._id': requestId },
                {
                    $set: {
                        'solicitudesAmistad.$[].recibidas.$[elem].estado': newStatus,
                        'solicitudesAmistad.$[].recibidas.$[elem].fecha': new Date()
                    }
                },
                { arrayFilters: [{ 'elem._id': requestId }] }
            );

            //let chatId = null;
            //if (newStatus === Status.Aceptada) {
            //    const chat = await this.privateChatsService.create(senderId, receiverId);
            //    
            //    if (chat) {
            //        chatId = chat._id || chat.id;
            //        
            //        // Actualizar la solicitud con el ID del chat
            //        await this.requestModel.findByIdAndUpdate(
            //            requestId,
            //            { chatPrivado: chatId },
            //            { session }
            //        ).exec();
            //    }
            //}

            await this.invalidate([
                `friendreq:req:${requestId}`,
                `friendreq:received:${receiverId}`,
                `friendreq:user:${senderId}`,
                `friendreq:user:${receiverId}`,
                this.buildPairKey(senderId, receiverId),
            ]);

            if (newStatus === Status.Aceptada) {
                await this.invalidate([
                    `friendreq:accepted:${senderId}`,
                    `friendreq:accepted:${receiverId}`,
                    `users:friends:${senderId}`,
                    `users:friends:${receiverId}`,
                ]);
            }

            return updatedRequest;
        } catch (error) {
            throw new HttpException(
                error.message || 'Error processing request',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async deleteRequest(requestId: string, userId: string) {
        const user = await this.usersService.findOneUser(userId);

        if (!user) {
            throw new HttpException("user not found", HttpStatus.NOT_FOUND);
        }
        const friendRequest = await this.findOneReq(requestId);

        if (!friendRequest) {
            throw new HttpException("friend request not found", HttpStatus.NOT_FOUND);
        }

        if (friendRequest.userEnvia._id.toString() !== userId) {
            throw new HttpException("You don't have authorization for this action", HttpStatus.UNAUTHORIZED);
        }

        const deleteRequest = await this.requestModel.findByIdAndDelete(requestId);
        if (!deleteRequest) {
            throw new HttpException("The request wasn't deleted", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const senderId = (friendRequest.userEnvia as any)._id.toString();
        const receiverId = (friendRequest.userRecibe as any)._id.toString();
        await this.invalidate([
            `friendreq:req:${requestId}`,
            `friendreq:received:${receiverId}`,
            `friendreq:user:${senderId}`,
            `friendreq:user:${receiverId}`,
            this.buildPairKey(senderId, receiverId),
        ]);
        return deleteRequest;
    }

    async findOneRequestByIds(user1Id: string, user2Id: string) {
        const cacheKey = this.buildPairKey(user1Id, user2Id);
        const cached = await this.cacheGet<any>(cacheKey);
        if (cached) return cached;

        const req = await this.requestModel.findOne({
            $or: [
                { userEnvia: user1Id, userRecibe: user2Id },
                { userEnvia: user2Id, userRecibe: user1Id },
            ],
        }).lean().exec();
        if (req) this.cacheSet(cacheKey, req, this.TTL_REQUEST_SECONDS);
        return req as any;
    }


    async findUserRequests(userId: string) {
        const cacheKey = `friendreq:user:${userId}`;
        const cached = await this.cacheGet<any[]>(cacheKey);
        if (cached) return cached;

        const list = await this.requestModel
            .find({ $or: [{ userEnvia: userId }, { userRecibe: userId }] })
            .populate('userEnvia', 'nombre imagen')
            .populate('userRecibe', 'nombre imagen')
            .lean()
            .exec();
        this.cacheSet(cacheKey, list, this.TTL_REQUEST_SECONDS);
        return list as any;
    }

    async findAcceptedFriendships(userId: string) {
        const cacheKey = `friendreq:accepted:${userId}`;
        const cached = await this.cacheGet<any[]>(cacheKey);
        if (cached) return cached as any;

        const list = await this.requestModel
            .find({
                status: Status.Aceptada,
                $or: [{ userEnvia: userId }, { userRecibe: userId }],
            })
            .populate('userEnvia', 'nombre imagen descripcion')
            .populate('userRecibe', 'nombre imagen descripcion')
            .lean()
            .exec();
        this.cacheSet(cacheKey, list, this.TTL_REQUEST_SECONDS);
        return list as any;
    }


}
