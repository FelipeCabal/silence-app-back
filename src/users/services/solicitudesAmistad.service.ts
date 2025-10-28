import { UsersService } from "./users.service";
import { forwardRef, HttpException, HttpStatus, Inject } from "@nestjs/common";
import { Status } from "src/config/enums/status.enum";
import { PrivateChatsService } from "src/chats/services/private-chats.service";
import { InjectModel } from "@nestjs/mongoose";
import { FriendRequest } from "../entities/solicitud.schema";
import { Model } from "mongoose";

export class SolicitudesAmistadService {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService,

        @Inject(forwardRef(() => PrivateChatsService))
        private readonly privateChatsService: PrivateChatsService,

        @InjectModel(FriendRequest.name)
        private readonly requestModel: Model<FriendRequest>
    ) { }

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
            userEnvia: userSend,
            userRecibe: userReceive,
            status: Status.Pendiente
        });

        return await friendRequest.save()
    }

    async findAllReceiveRequest(userId: string) {
        const user = await this.usersService.findOneUser(userId);

        if (!user) {
            throw new HttpException("user not found", HttpStatus.NOT_FOUND);
        }

        return this.requestModel
            .find({ userRecibe: userId, status: Status.Pendiente })
            .populate('userEnvia', 'nombre imagen descripcion');
    }

    async findOneReq(requestId: string) {
        return this.requestModel
            .findById(requestId)
            .populate('userEnvia', 'nombre imagen')
            .populate('userRecibe', 'nombre imagen')
    }

    async acceptedRequest(requestId: string, userId: string, newStatus: Status) {

        const request = await this.findOneReq(requestId);

        if (!request)
            throw new HttpException('Request not found', HttpStatus.NOT_FOUND);

        if (request.userRecibe._id.toString() !== userId)
            throw new HttpException("You're not authorized", HttpStatus.UNAUTHORIZED);

        if (newStatus === Status.Aceptada) {
            const chat = await this.privateChatsService.create(requestId);
            if (!chat)
                throw new HttpException('Error creating chat', HttpStatus.BAD_REQUEST);
        }

        return this.requestModel.findByIdAndUpdate(
            requestId,
            { status: newStatus },
        );
    }

    async declineRequest(requestId: string, userId: string, newStatus: Status) {

        const request = await this.findOneReq(requestId);

        if (!request)
            throw new HttpException('Request not found', HttpStatus.NOT_FOUND);

        if (request.userRecibe._id.toString() !== userId)
            throw new HttpException("You're not authorized", HttpStatus.UNAUTHORIZED);

        if (newStatus === Status.Rechazada) {
            const chat = await this.privateChatsService.create(requestId);
            if (!chat)
                throw new HttpException('Error creating chat', HttpStatus.BAD_REQUEST);
        }

        return this.requestModel.findByIdAndUpdate(
            requestId,
            { status: newStatus },
        );
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

        if (friendRequest.userEnvia.id.toString() !== userId) {
            throw new HttpException("You don't have authorization for this action", HttpStatus.UNAUTHORIZED);
        }

        const deleteRequest = await this.requestModel.findByIdAndDelete({ id: requestId });
        if (!deleteRequest) {
            throw new HttpException("The request wasn't deleted", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return deleteRequest;
    }

    async findOneRequestByIds(user1Id: string, user2Id: string) {
        return this.requestModel.findOne({
            $or: [
                { userEnvia: user1Id, userRecibe: user2Id },
                { userEnvia: user2Id, userRecibe: user1Id },
            ],
        });
    }


    async findUserRequests(userId: string) {
        return this.requestModel
            .find({ $or: [{ userEnvia: userId }, { userRecibe: userId }] })
            .populate('userEnvia', 'nombre imagen')
            .populate('userRecibe', 'nombre imagen');
    }

    async findAcceptedFriendships(userId: string) {
        return this.requestModel
            .find({
                status: Status.Aceptada,
                $or: [{ userEnvia: userId }, { userRecibe: userId }],
            })
            .populate('userEnvia', 'nombre imagen descripcion')
            .populate('userRecibe', 'nombre imagen descripcion')
            .exec();
    }


}
