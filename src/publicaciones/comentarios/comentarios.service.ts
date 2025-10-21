import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { comentariosSchema } from './entities/comentarios.schema';
import { Model } from 'mongoose';
import { CreateComentariosDto } from './dto/create-comentarios.dto';
import { PublicacionesService } from '../publicaciones.service';
import { UsersService } from 'src/users/services/users.service';


@Injectable()
export class ComentariosService {
    constructor
        (
            private readonly publicacionesService: PublicacionesService,
            private readonly usersService: UsersService,
            @InjectModel(comentariosSchema.name) private comentariosModel: Model<comentariosSchema>
        ) { }

    /**
     * 
     * @param postId 
     * @param createComentarioDto 
     * @returns 
     */
    async create(createComentarioDto: CreateComentariosDto, postId: number, usuarioId: number) {
        const postToComment = await this.publicacionesService.findOne(postId);

        if (!postToComment) {
            throw new HttpException("Post not found", HttpStatus.NOT_FOUND)
        }

        const newComment = new this.comentariosModel({
            ...createComentarioDto,
            postId,
            usuarioId
        });
        const comment = await newComment.save();

        return comment.toObject();
    }

    /**
     * 
     * @param postId 
     * @returns 
     */
    async findAllComments(postId: number) {
        const comments = await this.comentariosModel.find({ postId }).exec();

        const comentario = await Promise.all(comments.map(async (comment) => {
            const user = await this.usersService.findOneUser(comment.usuarioId);
            return {
                id: comment._id.toString(),
                postId: comment.postId,
                textoComentario: comment.comentario,
                usuario: {
                    id: user.id,
                    nombre: user.nombre,
                    email: user.email,
                    fechaNto: user.fechaNto,
                    sexo: user.sexo,
                    pais: user.pais,
                    imagenPerfil: user.imagen
                }
            }
        }));

        return comentario;
        
    }

    /**
     * 
     * @param commentId 
     * @param userId 
     * @returns 
     */
    async deleteComment(commentId: string, userId: number, postId: number) {
        const comment = await this.comentariosModel.findById(commentId);
        if (!comment) {
            throw new HttpException("comment not found", HttpStatus.NOT_FOUND);
        }

        const post = await this.publicacionesService.findOne(postId);
        if (!post) {
            throw new HttpException("post not found", HttpStatus.NOT_FOUND);
        }

        if (comment.usuarioId !== userId && post.user.id !== userId) {
            throw new HttpException("don't have authorization", HttpStatus.UNAUTHORIZED);
        }

        await this.comentariosModel.findByIdAndDelete(commentId);

        return { message: "Comment deleted successfylly" }
    }
}
