import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Publicacion } from '../entities/publicacion.schema';
import { Model } from 'mongoose';
import { CreatePublicacionDto } from '../dto/requests/create-publicacion.dto';
import { UpdatePublicacionDto } from '../dto/requests/update-publicacion.dto';
import { PublicacionResponseDto } from '../dto/responses/publicacion-response.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class PublicacionesService {
    constructor(
        @InjectModel(Publicacion.name)
        private publicacionesModel: Model<Publicacion>,

        private readonly redisService: RedisService,
    ) { }

    /**
     * Create a new post
     * @param data - The data to create a new post
     * @returns The created post
     */
    async create(data: CreatePublicacionDto): Promise<PublicacionResponseDto> {
        const newPost = await this.publicacionesModel.create(data);
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
    async findByUser(userId: string): Promise<PublicacionResponseDto[]> {
        const cacheKey = `publicaciones:user:${userId}`;
        const cached = await this.redisService.client.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const posts = await this.publicacionesModel.find({ userId }).exec();
        await this.redisService.client.set(cacheKey, JSON.stringify(posts), 'EX', 6000);
        return posts.map((post) => PublicacionResponseDto.fromModel(post));
    }

    /**
     * Update a post by its ID
     * @param id - The ID of the post
     * @param data - The data to update the post
     * @returns The updated post, or null if not found
     */
    async update(
        id: string,
        data: UpdatePublicacionDto,
    ): Promise<PublicacionResponseDto | null> {
        const post = await this.publicacionesModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();

        await this.redisService.client.del(`publicacion:${id}`);
        await this.redisService.client.del('publicaciones:all');
        /*if (post) {
          await this.redisService.client.del(`publicaciones:user:${post.userId}`);
        }*/
        return post ? PublicacionResponseDto.fromModel(post) : null;
    }

    /**
     * Remove a post by its ID
     * @param id - The ID of the post
     * @returns The removed post, or null if not found
     */
    async remove(id: string): Promise<PublicacionResponseDto | null> {
        const post = await this.publicacionesModel.findByIdAndDelete(id).exec();
        await this.redisService.client.del(`publicacion:${id}`);
        await this.redisService.client.del('publicaciones:all');
        /*await this.redisService.client.del(`publicaciones:user:${post.userId}`);*/
        return post ? PublicacionResponseDto.fromModel(post) : null;
    }
}
