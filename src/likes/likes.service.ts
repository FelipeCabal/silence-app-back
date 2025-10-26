import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Publicaciones } from 'src/publicaciones/entities/publicaciones.entity';
import { User } from 'src/users/entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class LikesService {

	constructor(
		@InjectModel(Publicaciones.name)
		private readonly publicacionesModel: Model<Publicaciones>,
		@InjectModel(User.name)
		private readonly userModel: Model<User>
	) { }

	async likePost(postId: string, userId: string) {
		const post = await this.publicacionesModel.findById(postId);
		const user = await this.userModel.findById(userId);

		if (!post) {
			throw new HttpException('post not found', HttpStatus.NOT_FOUND);
		}

		if (!user) {
			throw new HttpException('user not found', HttpStatus.NOT_FOUND);
		}

		user.likes.push({ postId } as any);
		await user.save();

		return post;
	}

	async unlikePost(postId: string, userId: number) {
		const post = await this.publicacionesModel.findById(postId);
		const user = await this.userModel.findById(userId);

		if (!post) {
			throw new HttpException('post not found', HttpStatus.NOT_FOUND);
		}

		if (!user) {
			throw new HttpException('user not found', HttpStatus.NOT_FOUND);
		}

		user.likes = user.likes.filter((like: any) => like.postId !== postId);
		await user.save();

		return post;
	}

	async findLikesByUser(userId: string) {
		const user = await this.userModel
			.findOne({ _id: userId })
			.populate('likes.postId');

		if (!user) {
			throw new HttpException('user not found', HttpStatus.NOT_FOUND);
		}

		if (!user.likes || user.likes.length === 0) {
			throw new HttpException('este usuario no tiene interacciones', HttpStatus.NOT_FOUND);
		}

	 	return user.likes;
	}
}
