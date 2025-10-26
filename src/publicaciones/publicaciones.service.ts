import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePublicacionesDto } from './dto/create-publicacione.dto';
import { UpdatePublicacionesDto } from './dto/update-publicacione.dto';
import { UsersService } from 'src/users/services/users.service';
import { Publicaciones } from './entities/publicaciones.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class PublicacionesService {

  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Publicaciones)
    private readonly publicacionesRepository: Repository<Publicaciones>

  ) { }


  /**
   * Create new post
   * @param userId id from post' creator 
   * @param createPublicacionesDto data to create a new post
   * @returns post newly created 
   */
  async create(userId: String, createPublicacionesDto: CreatePublicacionesDto) {
    if (createPublicacionesDto.esAnonimo === true) {
      const newPost = this.publicacionesRepository.create(createPublicacionesDto);

      return this.publicacionesRepository.save(newPost);
    }
    const user = await this.usersService.findOneUser(userId);
    const newPost = await this.publicacionesRepository.create(createPublicacionesDto);
    newPost.user = user;

    return this.publicacionesRepository.save(newPost)
  }

  /**
   * findALL
   * @param userId logged user
   * @returns all posts
   */
  async findAll(userId: String) {
    const friends = await this.usersService.findAllFriends(userId);

    const friendsIds = friends.map((friend => friend.user.id));

    let friendsPosts = []
    let otherPosts = []

    if (friendsIds.length > 0) {
      friendsPosts = await this.publicacionesRepository
        .createQueryBuilder('publicaciones')
        .leftJoinAndSelect('publicaciones.user', 'users')
        .where("publicaciones.userId IN (:...friendsIds)", { friendsIds })
        .orderBy("publicaciones.id", "DESC")
        .getMany()

      otherPosts = await this.publicacionesRepository
        .createQueryBuilder('publicaciones')
        .leftJoinAndSelect('publicaciones.user', 'users')
        .where("publicaciones.userId NOT IN (:...friendsIds)", { friendsIds })
        .orderBy('publicaciones.id', 'DESC')
        .getMany();
    } else {
      otherPosts = await this.publicacionesRepository
        .createQueryBuilder('publicaciones')
        .leftJoinAndSelect('publicaciones.user', 'users')
        .orderBy("publicaciones.id", "DESC")
        .getMany()
    }

    if (!friendsPosts && !otherPosts) {
      return "no hay posts"
    }

    const posts = [...friendsPosts, ...otherPosts]

    return posts;
  }

  /**
   * Find one post 
   * @param id from post that being searched
   * @returns post with the given id 
   * @throws {HttpException} if there is not post
   */
  async findOne(id: number) {
    const publicacion = await this.publicacionesRepository.findOne({
      where: { id: id.toString() },
      relations: ['user'],
    });

    if (!publicacion) {
      throw new HttpException('post not found', HttpStatus.NOT_FOUND);
    }
    return publicacion;
  }

  /**
   * findByUser
   * @param user is the id from users that have created post 
   * @returns all posts that have been created for the given user
   * @throws {HttpException} if the user not found 
   */
  async findByUser(userId: number) {
    const userPosts = await this.publicacionesRepository
      .createQueryBuilder('publicaciones')
      .leftJoinAndSelect('publicaciones.user', 'users')
      .where('users.id = :userId', { userId })
      .orderBy('publicaciones.id', 'DESC')
      .getMany();

    if (!userPosts.length) {
      throw new HttpException("user's posts not found", HttpStatus.NOT_FOUND);
    }
    return userPosts;
  }

  /**
   * update
   * @param id post id
   * @param updatePublicacionesDto data to update post
   * @param userId user id
   * @returns post updated
   * @throws {HttpException} if the post doesn't exists, if the user isn´t authorized, internal error.
   */
  async update(id: number, updatePublicacionesDto: UpdatePublicacionesDto, userId: number) {
    const post = await this.findOne(id)

    if (!post) {
      throw new HttpException("post doesn't exists. ", HttpStatus.NOT_FOUND);
    }

    if (post.user.id !== userId) {
      throw new HttpException("You don't have authorization for update", HttpStatus.UNAUTHORIZED);
    }

    await this.publicacionesRepository.update(id, updatePublicacionesDto);

    const updatePost = await this.findOne(id)

    return updatePost;
  }

  /**
   * remove
   * @param id id post
   * @param userId user id
   * @returns post deleted
   * @throws {HttpException} if the post doesn't exists, if the user isn´t authorized, internal error.
   */
  async remove(id: number, userId: number) {
    const post = await this.findOne(id)

    if (!post) {
      throw new HttpException("The post doesn't exists", HttpStatus.NOT_FOUND);
    }

    if (post.user.id !== userId) {
      throw new HttpException("You don't have authorization for this action.", HttpStatus.UNAUTHORIZED);
    }

    await this.publicacionesRepository.delete(id);

    return post;
  }
}
