import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ConflictException } from "@nestjs/common";
import { Publicacion } from "src/publicaciones/entities/publicacion.schema";
import { PublicacionModel } from "src/publicaciones/models/publciacion-summary.model";
import { UserSchema } from "src/users/entities/users.schema";
import { RedisService } from "src/redis/redis.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PostEventPayload } from "src/notifications/listeners/post.listener";
import { PublicacionResponseDto } from "src/publicaciones/dto/responses/publicacion-response.dto";

export class LikesService {
    constructor(
        @InjectModel(UserSchema.name) private readonly userModel: Model<UserSchema>,
        @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
        private readonly redisService: RedisService,
        private readonly emitter: EventEmitter2,
    ) { }

    async getUserLikes(userId: string) {

        const cachedLikes = await this.redisService.client.get(`user:${userId}:likes`);
        if (cachedLikes) {
            return JSON.parse(cachedLikes);
        }
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new Error(`Usuario con id ${userId} no encontrado`);
        }
        return user.likes;
    }

    async likePost(postId: string, userId: string) {
        const user = await this.userModel.findById(userId);
        const publicacion = await this.publicacionModel.findById(postId);
        const publicacionSummary = PublicacionModel.fromModel(publicacion);

        if (!user) {
            throw new Error(`Usuario con id ${userId} no encontrado`);
        }

        if (!publicacion) {
            throw new Error(`Publicación con id ${postId} no encontrada`);
        }

        const userObjectId = new Types.ObjectId(userId);

        const alreadyLikedPost = publicacion.likes?.some((id: any) => {
            return id?.toString?.() === userId;
        });

        const alreadyLikedInUser = user.likes?.some((post: any) => {
            return post._id?.toString?.() === postId;
        });


        if (alreadyLikedPost || alreadyLikedInUser) {
            throw new ConflictException('El usuario ya dio like a esta publicación');
        }

        publicacion.likes.push(userObjectId);
        publicacion.cantLikes = publicacion.likes.length;
        await publicacion.save();

        // Add owner info to the summary if not anonymous
        if (!publicacion.esAnonimo && publicacion.owner) {
            const ownerId = typeof publicacion.owner === 'string' ? publicacion.owner : publicacion.owner.toString();
            const owner = await this.userModel.findById(ownerId).select('_id nombre imagen').lean();
            if (owner) {
                publicacionSummary.owner = {
                    _id: owner._id.toString(),
                    nombre: owner.nombre,
                    imagen: owner.imagen || null,
                    userId: owner._id.toString()
                } as any;
            }
        }

        user.likes.push(publicacionSummary as any);
        await user.save();

        const eventPayload: PostEventPayload = {
            post: PublicacionResponseDto.fromModel(publicacion),
            sender: user,
        }

        this.emitter.emit('post.liked', eventPayload);

        await this.redisService.client.del(`publicacion:${publicacion._id.toString()}`);
        await this.redisService.client.del('publicaciones:all');
        //hace falta el publicaciones de un usuario pero aqui no se cual es el usuario que creo la publicación aun
        await this.redisService.client.del(`user:${userId}`);
        await this.redisService.client.del(`profile:${userId}`);
        await this.redisService.client.del(`user:email:${user.email}`);

        await this.redisService.client.set(`publicacion:${publicacion._id.toString()}`, JSON.stringify(publicacion), 'EX', 6000);
        await this.redisService.client.set(`user:${userId}`, JSON.stringify(user), 'EX', 6000);
        await this.redisService.client.set(`profile:${userId}`, JSON.stringify(user), 'EX', 6000);
        await this.redisService.client.set(`user:email:${user.email}`, JSON.stringify(user), 'EX', 6000);

        return { message: 'Post liked successfully' };
    }

    async unlikePost(postId: string, userId: string) {
        const user = await this.userModel.findById(userId);
        const publicacion = await this.publicacionModel.findById(postId);

        if (!user) {
            throw new Error(`Usuario con id ${userId} no encontrado`);
        }

        if (!publicacion) {
            throw new Error(`Publicación con id ${postId} no encontrada`);
        }

        publicacion.likes = publicacion.likes.filter(user => user.toString() !== userId);
        publicacion.cantLikes = publicacion.likes.length;
        await publicacion.save();

        user.likes = user.likes.filter(publicacion => publicacion._id.toString() !== postId);
        await user.save();

        await this.redisService.client.del(`publicacion:${publicacion._id.toString()}`);
        await this.redisService.client.del('publicaciones:all');
        //hace falta el publicaciones de un usuario pero aqui no se cual es el usuario que creo la publicación aun
        await this.redisService.client.del(`user:${userId}`);
        await this.redisService.client.del(`profile:${userId}`);
        await this.redisService.client.del(`user:email:${user.email}`);

        await this.redisService.client.set(`publicacion:${publicacion._id.toString()}`, JSON.stringify(publicacion), 'EX', 6000);
        await this.redisService.client.set(`user:${userId}`, JSON.stringify(user), 'EX', 6000);
        await this.redisService.client.set(`profile:${userId}`, JSON.stringify(user), 'EX', 6000);
        await this.redisService.client.set(`user:email:${user.email}`, JSON.stringify(user), 'EX', 6000);


        return { message: 'Post unliked successfully' };
    }
}