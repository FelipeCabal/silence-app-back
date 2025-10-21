import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './like.entity';
import { Publicaciones } from 'src/publicaciones/entities/publicaciones.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class LikesService {

  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Publicaciones)
    private readonly publicacionesRepository: Repository<Publicaciones>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async manejoLikes(userId: number, publicacionesId: number) {
    const usuario = await this.userRepository.findOne({ where: { id: userId } });
    const publicaciones = await this.publicacionesRepository.findOne({ where: { id: publicacionesId.toString() } });

    if (!usuario || !publicaciones) {
      throw new HttpException("user or post not found", HttpStatus.NOT_FOUND);
    }

    const existeLike = await this.likeRepository.findOne({
      where: { user: { id: userId }, publicaciones: { id: publicacionesId.toString() } }
    });

    if (existeLike) {
      await this.likeRepository.remove(existeLike);
      return 'se eliminó el like del post';
    }
    else {
      const newLike = this.likeRepository.create({
        user: { id: userId },
        publicaciones: {
          id: publicacionesId.toString()
        }
      });

      await this.likeRepository.save(newLike);

      return newLike;
    }
  }

  async findAllLikes(postId: number) {

    const post = await this.publicacionesRepository.findOne({
      where: { id: postId.toString() }
    })

    if (!post) {
      throw new HttpException("post not found", HttpStatus.NOT_FOUND);
    }

    const likes = await this.likeRepository
      .createQueryBuilder('like')
      .leftJoinAndSelect('like.user', 'users')
      .where('like.publicacionesId = :postId', { postId })
      .getMany()

    if (likes.length === 0) {
      throw new HttpException("likes not found", HttpStatus.NOT_FOUND);
    }

    return likes;
  }

  async findOneLike(likeId: number) {
    const like = await this.likeRepository.findOne({
      where: { id: likeId }
    })

    if (!like) {
      throw new HttpException("like not found", HttpStatus.NOT_FOUND);
    }

    return like;
  }

  async findLikesByUser(userId: number, requesterId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    }

    let likes = []

    if (user.showLikes === false) {
      if (userId !== requesterId) {
        return "No hay actividad para mostrar"
      }
    }
    else {

      likes = await this.publicacionesRepository
        .createQueryBuilder('post')
        .innerJoin('post.likes', 'like')
        .leftJoinAndSelect('post.user', 'user')
        .where("like.userId = :userId", { userId })
        .getMany();

      return likes;
    }
  }
}
