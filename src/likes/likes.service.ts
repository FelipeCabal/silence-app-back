import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ConflictException } from "@nestjs/common";
import { Publicacion } from "src/publicaciones/entities/publicacion.schema";
import { PublicacionModel } from "src/publicaciones/models/publciacion-summary.model";
import { UserSchema } from "src/users/entities/users.schema";

export class LikesService {
    constructor(
        @InjectModel(UserSchema.name) private readonly userModel: Model<UserSchema>,
        @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    ) { }

    async getUserLikes(userId: string) {
        const user = await this.userModel.findById(userId).populate('likes');
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

        user.likes.push(publicacionSummary as any);
        await user.save();


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

        return { message: `Publicación con id ${postId} deslikeada por el usuario con id ${userId}` };
    }
}