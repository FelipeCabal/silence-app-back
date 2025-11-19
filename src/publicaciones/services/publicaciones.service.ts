import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Publicacion } from '../entities/publicacion.schema';
import { Model, Types } from 'mongoose';
import { CreatePublicacionDto } from '../dto/requests/create-publicacion.dto';
import { UpdatePublicacionDto } from '../dto/requests/update-publicacion.dto';
import { PublicacionResponseDto } from '../dto/responses/publicacion-response.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { RedisService } from '../../redis/redis.service';
import { PostQueries } from '../dto/requests/querie.dto';
import { UserSchema } from 'src/users/entities/users.schema';
import { User } from 'src/users/entities/user.model';
import { PublicacionModel } from '../models/publciacion-summary.model';
import { throwError } from 'rxjs';

@Injectable()
export class PublicacionesService {
    constructor(
        @InjectModel(Publicacion.name)
        private publicacionesModel: Model<Publicacion>,

        @InjectModel(UserSchema.name)
        private usersModel: Model<UserSchema>,

        private readonly redisService: RedisService,
    ) { }

    private readonly TTL_USER_SECONDS = 600;
    private readonly TTL_COLLECTION_SECONDS = 600;

    private buildSearchKey(postId: string, q: PostQueries): string {
        const parts = [
            'post:search',
            postId,
            q.esAnonimo || false,
            (q.limit || 0).toString(),
        ];
        return parts.join(':')
    }

    private async cacheSet(key: string, value: any, ttl: number) {
        try {
            await this.redisService.client.set(key, JSON.stringify(value), 'EX', ttl);
        } catch (err) {

        }
    }

    private async cacheGet<T = any>(key: string): Promise<T | null> {
        try {
            const raw = await this.redisService.client.get(key);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    /**
     * Create a new post
     * @param data - The data to create a new post
     * @returns The created post
     */
    async create(data: CreatePublicacionDto, userId: string): Promise<PublicacionResponseDto> {
        const summary = data;

        const user = await this.usersModel.findById(userId, 'nombre imagen')

        const userField = data.esAnonimo ? 'pubAnonimas' : 'publicaciones';

        let createdPost = null;

        try {
            createdPost = await this.publicacionesModel.create({
                ...data,
                owner: { ...user, userId }
            });

            const updateInUser = await this.usersModel.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        [userField]: {
                            id: createdPost._id,
                            summary
                        }
                    }
                },
                { new: true }
            );

            // Si el usuario no existe o no se pudo actualizar → limpiamos y error
            if (!updateInUser) {
                await this.publicacionesModel.findByIdAndDelete(createdPost._id);
                throw new Error('User not found or failed to update user publications');
            }

        } catch (err) {
            // Si algo falla después de crear el post, lo eliminamos para evitar basura
            if (createdPost && createdPost._id) {
                try {
                    await this.publicacionesModel.findByIdAndDelete(createdPost._id);
                } catch (cleanupError) {
                    // puedes loguearlo si deseas
                }
            }

            throw new HttpException(
                'Error creating post',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        // 3) Invalidar cache
        await this.redisService.client.del('publicaciones:all');

        return PublicacionResponseDto.fromModel(createdPost)
    }

    /**
     * Get all posts
     * @returns An array of all posts
     */
    async findAll(): Promise<PublicacionResponseDto[]> {
        try {
            // Obtener posts públicos (con usuario)
            const publicPosts = await this.publicacionesModel
                .find({ esAnonimo: false })
                .sort({ createdAt: -1 })
                .lean();

            // Obtener posts anónimos (sin usuario)
            const anonPosts = await this.publicacionesModel
                .find({ esAnonimo: true })
                .select('-owner') // Excluye el campo usuario
                .sort({ createdAt: -1 })
                .lean();

            // Combinar y ordenar
            const allPosts = [...publicPosts, ...anonPosts]
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            return allPosts.map(post => PublicacionResponseDto.fromModel(post));
        } catch (err) {
            throw new HttpException(
                'Error fetching posts',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    /**
     * Get a post by its ID
     * @param id - The ID of the post
     * @returns The post with the given ID, or null if not found
     */
    async findOne(id: string): Promise<PublicacionResponseDto | null> {
        const cacheKey = `publicacion:${id}`;
        const cached = await this.redisService.client.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const post = await this.publicacionesModel.findById(id).exec();
        await this.redisService.client.set(cacheKey, JSON.stringify(post), 'EX', 6000);
        return post ? PublicacionResponseDto.fromModel(post) : null;
    }

    /**
     * Get all posts by a user
     * @param userId - The ID of the user
     * @returns An array of posts by the user
     */
    async findByUser(userId: string, postQueries: PostQueries, reqUser: string): Promise<PublicacionResponseDto[]> {
        const cacheKey = this.buildSearchKey(userId, postQueries);
        const cached = await this.cacheGet<any[]>(cacheKey);

        if (cached) {
            return cached;
        }

        const includeAnonymous = postQueries.esAnonimo === 'true';

        const query: any = { user: userId };

        if (includeAnonymous && reqUser != userId) {
            throw new HttpException("You are not allowed to view anonymous posts from another user", HttpStatus.FORBIDDEN);
        }

        if (includeAnonymous) {
            query.esAnonimo = true;   // Solo anónimos
        } else {
            query.esAnonimo = false;  // Solo públicos (default)
        }

        const posts = await this.publicacionesModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(postQueries.limit || 0)
            .lean()
            .exec();

        if (!posts || posts.length === 0) {
            throw new HttpException("There are no posts", HttpStatus.NOT_FOUND);
        }

        const result = posts.map((post) =>
            PublicacionResponseDto.fromModel(post)
        );

        await this.cacheSet(cacheKey, result, this.TTL_COLLECTION_SECONDS);

        return result;
    }


    /**
     * Update a post by its ID
     * @param id - The ID of the post
     * @param data - The data to update the post
     * @returns The updated post, or null if not found
     */
    async update(postId: string, data: UpdatePublicacionDto, userId: string): Promise<PublicacionResponseDto | null> {

        const post = await this.publicacionesModel.findById(postId)

        if (!post) {
            throw new HttpException('post not found', HttpStatus.NOT_FOUND);
        }

        if (post.owner._id.toString() !== userId) {
            throw new HttpException("You aren't authorized for this action", HttpStatus.FORBIDDEN);
        }

        try {
            const updatedPost = await this.publicacionesModel
                .findByIdAndUpdate(postId, data, { new: true })
                .exec();

            if (!updatedPost) {
                throw new HttpException('Error updating post', HttpStatus.INTERNAL_SERVER_ERROR);
            }

            const postObjectId = new Types.ObjectId(postId)


            if (updatedPost.esAnonimo) {
                await this.usersModel.updateOne(
                    { "pubAnonimas.id": postObjectId },
                    {
                        $set: {
                            'pubAnonimas.$.summary': {
                                esAnonimo: updatedPost.esAnonimo,
                                description: updatedPost.description,
                                imagen: updatedPost.imagen
                            }
                        }
                    },
                );
            } else {

                await this.usersModel.updateOne(
                    { "publicaciones.id": postObjectId },
                    {
                        $set: {
                            'publicaciones.$.summary': {
                                esAnonimo: updatedPost.esAnonimo,
                                description: updatedPost.description,
                                imagen: updatedPost.imagen
                            }
                        }
                    }
                )
            }
            await this.redisService.client.del(`publicacion:${postId}`);
            await this.redisService.client.del('publicaciones:all');
            /*if (post) {
              await this.redisService.client.del(`publicaciones:user:${post.userId}`);
            }*/
            return updatedPost ? PublicacionResponseDto.fromModel(updatedPost) : null;

        } catch (error) {
            throw new HttpException(
                error.message || 'error processing request', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove a post by its ID
     * @param id - The ID of the post
     * @returns The removed post, or null if not found
     */
    async remove(id: string, userId: string): Promise<PublicacionResponseDto | null> {

        const post = await this.publicacionesModel.findById(id)

        if (!post) {
            throw new HttpException("post not found", HttpStatus.NOT_FOUND);
        }

        if (post.owner.toString() !== userId) {
            throw new HttpException("You aren't authorized for this action", HttpStatus.FORBIDDEN);
        }
        const result = await this.publicacionesModel.findByIdAndDelete(id).exec();
        await this.redisService.client.del(`publicacion:${id}`);
        await this.redisService.client.del('publicaciones:all');
        /*await this.redisService.client.del(`publicaciones:user:${post.userId}`);*/
        return result ? PublicacionResponseDto.fromModel(result) : null;
    }
}
