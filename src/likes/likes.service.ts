import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConflictException } from '@nestjs/common';
import { Publicacion } from 'src/publicaciones/entities/publicacion.schema';
import { PublicacionModel } from 'src/publicaciones/models/publciacion-summary.model';
import { UserSchema } from 'src/users/entities/users.schema';
import { RedisService } from 'src/redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostEventPayload } from 'src/notifications/listeners/post.listener';
import { PublicacionResponseDto } from 'src/publicaciones/dto/responses/publicacion-response.dto';

export class LikesService {
  constructor(
    @InjectModel(UserSchema.name) private readonly userModel: Model<UserSchema>,
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
    private readonly redisService: RedisService,
    private readonly emitter: EventEmitter2,
  ) {}

  async getUserLikes(userId: string) {
    const cachedLikes = await this.redisService.client.get(
      `user:${userId}:likes`,
    );
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

    if (!publicacion.esAnonimo && publicacion.owner) {
      const ownerId =
        typeof publicacion.owner === 'object' && publicacion.owner._id
          ? publicacion.owner._id.toString()
          : publicacion.owner.toString();
      const owner = await this.userModel
        .findById(ownerId)
        .select('_id nombre imagen')
        .lean();
      if (owner) {
        publicacionSummary.owner = {
          _id: owner._id.toString(),
          nombre: owner.nombre,
          imagen: owner.imagen || null,
          userId: owner._id.toString(),
        } as any;
      }
    }

    publicacionSummary.cantLikes = publicacion.cantLikes;

    user.likes.push(publicacionSummary as any);
    await user.save();

    const eventPayload: PostEventPayload = {
      post: PublicacionResponseDto.fromModel(publicacion),
      sender: user,
    };

    this.emitter.emit('post.liked', eventPayload);

      await this.userModel.updateMany(
    { 'publicaciones.id': new Types.ObjectId(postId)  },
    {
      $set: {
        'publicaciones.$.cantLikes': publicacion.cantLikes,
      },
    },
  );

  await this.userModel.updateMany(
  { 'pubAnonimas.id': new Types.ObjectId(postId)  },
  {
    $set: {
      'pubAnonimas.$.cantLikes': publicacion.cantLikes,
    },
  },
);


   await this.userModel.updateMany(
  { 'likes._id': postId },
  {
    $set: {
      'likes.$.cantLikes': publicacion.cantLikes,
    },
  },
);


   await this.redisService.client.del(
      `publicacion:${publicacion.id.toString()}`,
    );
    await this.redisService.client.del('publicaciones:all');
    await this.redisService.client.del(`user:${userId}`);
    await this.redisService.client.del(`profile:${userId}`);
    await this.redisService.client.del(`user:email:${user.email}`);
    
      await this.redisService.client.set(
    `publicacion:${postId}`,
    JSON.stringify(PublicacionResponseDto.fromModel(publicacion)),
    'EX',
    6000,
  );


  const refreshedAllPosts = await this.publicacionModel.find()
    .sort({ createdAt: -1 })
    .lean();
  await this.redisService.client.set(
    'publicaciones:all',
    JSON.stringify(refreshedAllPosts),
    'EX',
    6000,
  );

   const refreshedUser = await this.userModel.findById(userId)
    .select('_id nombre imagen publicaciones pubAnonimas likes email')
    .lean();

  await this.redisService.client.set(
    `user:${userId}`,
    JSON.stringify(refreshedUser),
    'EX',
    6000,
  );

    await this.redisService.client.set(
      `profile:${userId}`,
      JSON.stringify(user),
      'EX',
      6000,
    );
    await this.redisService.client.set(
      `user:email:${user.email}`,
      JSON.stringify(user),
      'EX',
      6000,
    );

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

     const hasLiked = publicacion.likes?.some((id: any) => {
      return id?.toString?.() === userId;
    });

    if (!hasLiked) {
      throw new ConflictException('El usuario no ha dado like a esta publicación');
    }

    publicacion.likes = publicacion.likes.filter(
      (u) => u?.toString?.() !== userId,
    );
    publicacion.cantLikes = publicacion.likes.length;
    await publicacion.save();

    user.likes = user.likes.filter((pub: any) => {
      if (!pub) return false;
      if (!pub._id) return false;
      return pub._id.toString() !== postId;
    });
    await user.save();

     await this.userModel.updateMany(
    { 'publicaciones.id': new Types.ObjectId(postId) },
    {
      $set: {
        'publicaciones.$.cantLikes': publicacion.cantLikes,
      },
    },
  );

  await this.userModel.updateMany(
    { 'pubAnonimas.id': new Types.ObjectId(postId)  },
    {
      $set: {
        'pubAnonimas.$.cantLikes': publicacion.cantLikes,
      },
    },
  );

   await this.userModel.updateMany(
  {
    'likes._id': postId,
    _id: { $ne: userId }
  },
  {
    $set: {
      'likes.$.cantLikes': publicacion.cantLikes,
    },
  },
);

      await this.redisService.client.del(
      `publicacion:${publicacion.id.toString()}`,
    );
    await this.redisService.client.del('publicaciones:all');
    await this.redisService.client.del(`user:${userId}`);
    await this.redisService.client.del(`profile:${userId}`);
    await this.redisService.client.del(`user:email:${user.email}`);

    const refreshedUser = await this.userModel.findById(userId)
    .select('_id nombre imagen publicaciones pubAnonimas likes email')
    .lean();

  await this.redisService.client.set(
    `publicacion:${publicacion.id.toString()}`,
    JSON.stringify(PublicacionResponseDto.fromModel(publicacion)),
    'EX',
    6000,
  );

  await this.redisService.client.set(
    `user:${userId}`,
    JSON.stringify(refreshedUser),
    'EX',
    6000,
  );

    return { message: 'Post unliked successfully' };
  }
}
