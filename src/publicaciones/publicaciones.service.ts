import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Publicacion } from "./entities/publicacion.schema";
import { Model } from "mongoose";
import { CreatePublicacionDto } from "./dto/requests/create-publicacion.dto";
import { UpdatePublicacionDto } from "./dto/requests/update-publicacion.dto";
import { PublicacionResponseDto } from "./dto/responses/publicacion-response.dto";
import { Public } from "src/auth/decorators/public.decorator";

@Injectable()
export class PublicacionesService {
    constructor(
        @InjectModel(Publicacion.name) private publicacionesModel: Model<Publicacion>
    ) { }

    /**
     * Create a new post
     * @param data - The data to create a new post
     * @returns The created post
     */
    async create(data: CreatePublicacionDto): Promise<PublicacionResponseDto> {
        const newPost = await this.publicacionesModel.create(data);
        return PublicacionResponseDto.fromModel(newPost);
    }

    /**
     * Get all posts
     * @returns An array of all posts
     */
    async findAll(): Promise<PublicacionResponseDto[]> {
        const posts = await this.publicacionesModel.find().exec();
        return posts.map(post => PublicacionResponseDto.fromModel(post));
    }

    /**
     * Get a post by its ID
     * @param id - The ID of the post
     * @returns The post with the given ID, or null if not found
     */
    async findOne(id: string): Promise<PublicacionResponseDto | null> {
        const post = await this.publicacionesModel.findById(id).exec();
        return post ? PublicacionResponseDto.fromModel(post) : null;
    }

    /**
     * Get all posts by a user
     * @param userId - The ID of the user
     * @returns An array of posts by the user
     */
    async findByUser(userId: string): Promise<PublicacionResponseDto[]> {
        const posts = await this.publicacionesModel.find({ userId }).exec();
        return posts.map(post => PublicacionResponseDto.fromModel(post));
    }

    /**
     * Update a post by its ID
     * @param id - The ID of the post
     * @param data - The data to update the post
     * @returns The updated post, or null if not found
     */
    async update(id: string, data: UpdatePublicacionDto): Promise<PublicacionResponseDto | null> {
        const post = await this.publicacionesModel.findByIdAndUpdate(id, data, { new: true }).exec();
        return post ? PublicacionResponseDto.fromModel(post) : null;
    }

    /**
     * Remove a post by its ID
     * @param id - The ID of the post
     * @returns The removed post, or null if not found
     */
    async remove(id: string): Promise<PublicacionResponseDto | null> {
        const post = await this.publicacionesModel.findByIdAndDelete(id).exec();
        return post ? PublicacionResponseDto.fromModel(post) : null;
    }
}