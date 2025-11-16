import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Publicacion } from '../entities/publicacion.schema';
import { Model } from 'mongoose';
import { CreatePublicacionDto } from '../dto/requests/create-publicacion.dto';
import { UpdatePublicacionDto } from '../dto/requests/update-publicacion.dto';
import { PublicacionResponseDto } from '../dto/responses/publicacion-response.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { RedisService } from '../../redis/redis.service';
import { PostQueries } from '../dto/requests/querie.dto';

@Injectable()
export class PublicacionesService {
    constructor(
        @InjectModel(Publicacion.name)
        private publicacionesModel: Model<Publicacion>,

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
        const newPost = await this.publicacionesModel.create({ ...data, user: userId.toString() });
        await this.redisService.client.del('publicaciones:all');
        return PublicacionResponseDto.fromModel(newPost);
    }

    /**
     * Get all posts
     * @returns An array of all posts
     */
    async findAll(): Promise<PublicacionResponseDto[]> {

        const cacheKey = 'publicaciones:all';
        const cached = await this.redisService.client.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const posts = await this.publicacionesModel.find().exec();

        await this.redisService.client.set(cacheKey, JSON.stringify(posts), 'EX', 6000);
        return posts.map((post) => PublicacionResponseDto.fromModel(post));
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

        if (post.user.toString() !== userId) {
            throw new HttpException("You aren't authorized for this action", HttpStatus.FORBIDDEN);
        }

        const updatedPost = await this.publicacionesModel
            .findByIdAndUpdate(postId, data, { new: true })
            .exec();

        await this.redisService.client.del(`publicacion:${postId}`);
        await this.redisService.client.del('publicaciones:all');
        /*if (post) {
          await this.redisService.client.del(`publicaciones:user:${post.userId}`);
        }*/
        return updatedPost ? PublicacionResponseDto.fromModel(updatedPost) : null;
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

        if (post.user.toString() !== userId) {
            throw new HttpException("You aren't authorized for this action", HttpStatus.FORBIDDEN);
        }
        const result = await this.publicacionesModel.findByIdAndDelete(id).exec();
        await this.redisService.client.del(`publicacion:${id}`);
        await this.redisService.client.del('publicaciones:all');
        /*await this.redisService.client.del(`publicaciones:user:${post.userId}`);*/
        return result ? PublicacionResponseDto.fromModel(result) : null;
    }
}
