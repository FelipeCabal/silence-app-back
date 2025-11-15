import { forwardRef, HttpException, HttpStatus, Inject, Injectable, } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from 'src/config/constants/bycript.constants';
import { SolicitudesAmistadService } from './solicitudesAmistad.service';
import { UserQueries } from '../dto/querie.dto';
import { UserSchema } from '../entities/users.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserSchema.name) private readonly userModel: Model<UserSchema>,
    @Inject(forwardRef(() => SolicitudesAmistadService))
    private readonly solicitudAmistadServices: SolicitudesAmistadService,
    private readonly redisService: RedisService,
  ) { }

  private readonly TTL_USER_SECONDS = 600;
  private readonly TTL_COLLECTION_SECONDS = 600;

  private buildSearchKey(userId: string, q: UserQueries): string {
    const parts = [
      'users:search',
      userId,
      q.search || '',
      q.country || '',
      (q.limit || 0).toString(),
    ];
    return parts.join(':');
  }

  private async cacheSet(key: string, value: any, ttl: number) {
    try {
      await this.redisService.client.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (err) {

    }
  }

  /** Get & parse JSON cache */
  private async cacheGet<T = any>(key: string): Promise<T | null> {
    try {
      const raw = await this.redisService.client.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private async invalidate(keys: string[]) {
    try {
      if (keys.length) {
        await this.redisService.client.del(...keys);
      }
    } catch { }
  }

  /**
   * Función para crear un usuario
   * @param createUser 
   * @returns 
   */
  async createUser(createUser: CreateUserDto) {
    const exists = await this.userModel.findOne({ email: createUser.email });
    if (exists) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    createUser.password = bcrypt.hashSync(createUser.password, SALT_ROUNDS);
    const user = new this.userModel(createUser);
    const saved = await user.save();
    const safe = { ...saved.toObject(), password: undefined };

    this.cacheSet(`user:${saved._id}`, safe, this.TTL_USER_SECONDS);
    this.cacheSet(`user:email:${saved.email}`, { ...saved.toObject() }, this.TTL_USER_SECONDS);
    return saved;
  }

  /**
   * Función para buscar a todos los usuarios usando queries / filtros
   * @param userId 
   * @param userQueries 
   * @returns lista de usuarios que cumplen con los criterios de búsqueda
   */
  async findAllUsers(userId: string, userQueries: UserQueries): Promise<any[]> {
    const cacheKey = this.buildSearchKey(userId, userQueries);
    const cached = await this.cacheGet<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    let query: any = { _id: { $ne: userId } };

    if (userQueries.search) {
      query.$or = [
        { nombre: { $regex: userQueries.search, $options: 'i' } },
        { email: { $regex: userQueries.search, $options: 'i' } },
      ];
    }
    if (userQueries.country) {
      query.pais = { $regex: userQueries.country, $options: 'i' };
    }

    const users = await this.userModel
      .find(query)
      .limit(userQueries.limit || 0)
      .sort({ nombre: 1 })
      .lean()
      .exec();

    if (!users || users.length === 0) {
      throw new HttpException(
        'No se encontraron usuarios que coincidan con la búsqueda.', HttpStatus.NOT_FOUND
      );
    }

    const result = users.map(user => ({
      id: user._id.toString(),
      nombre: user.nombre,
      descripcion: user.descripcion,
      imagen: user.imagen,
      email: user.email,
      fechaNto: user.fechaNto,
      sexo: user.sexo,
      pais: user.pais
    }));

    this.cacheSet(cacheKey, result, this.TTL_COLLECTION_SECONDS);
    return result;
  }

  async findAllFriends(userId: string) {
    const cacheKey = `users:friends:${userId}`;
    const cached = await this.cacheGet<any[]>(cacheKey);
    if (cached) return cached;

    const acceptedRequests = await this.solicitudAmistadServices.findAcceptedFriendships(userId);
    if (!acceptedRequests.length) {
      this.cacheSet(cacheKey, [], this.TTL_COLLECTION_SECONDS);
      return [];
    }
    const amigos = acceptedRequests.map(request => {
      const isSender = request.userEnvia._id.toString() === userId;
      const amigo: any = isSender ? request.userRecibe : request.userEnvia;
      const safe: any = { ...amigo };
      if ('password' in safe) delete safe.password;
      safe._id = safe._id?.toString?.() || safe._id;
      return safe;
    });
    this.cacheSet(cacheKey, amigos, this.TTL_COLLECTION_SECONDS);
    return amigos;
  }

  /**
   * Función para buscar sólo un usuario 
   * @param id 
   * @returns Usuario
   */
  async findOneUser(id: string) {
    const cacheKey = `user:${id}`;
    const cached = await this.cacheGet<any>(cacheKey);
    if (cached) return cached;

    const user = await this.userModel.findById(id).select('-password').lean().exec();
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const safe = { ...user, _id: user._id.toString() };
    this.cacheSet(cacheKey, safe, this.TTL_USER_SECONDS);
    return safe;
  }

  /**
   * Función para actualizar un usuario
   * @param id 
   * @param updateUser 
   * @returns usuario actualizado.
   */
  async update(id: string, updateUser: UpdateUserDto) {
    if (updateUser.password) {
      updateUser.password = bcrypt.hashSync(updateUser.password, SALT_ROUNDS);
    }

    // Obtener email previo para invalidar cache por email si cambia
    const previous = await this.userModel.findById(id).select('email').lean();
    if (!previous) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const updated = await this.userModel.findByIdAndUpdate(id, updateUser, { new: true }).lean();
    if (!updated) {
      throw new HttpException("User hasn't been updated", HttpStatus.CONFLICT);
    }

    const safe = { ...updated, _id: updated._id.toString() };

    await this.invalidate([
      `user:${id}`,
      `profile:${id}`,
      `user:email:${previous.email}`,
      `user:email:${updated.email}`,
      `users:friends:${id}`,
    ]);

    this.cacheSet(`user:${id}`, safe, this.TTL_USER_SECONDS);
    this.cacheSet(`user:email:${updated.email}`, safe, this.TTL_USER_SECONDS);
    this.cacheSet(`profile:${id}`, safe, this.TTL_USER_SECONDS);

    return safe;
  }

  /**
   * Función para eliminar un usuario
   * @param id 
   * @returns usuario eliminado
   */
  async remove(id: string) {
    const userDelete = await this.userModel.findByIdAndDelete(id).lean();
    if (!userDelete) {
      throw new HttpException("User can't be delete", HttpStatus.CONFLICT);
    }
    await this.invalidate([
      `user:${id}`,
      `profile:${id}`,
      `user:email:${userDelete.email}`,
      `users:friends:${id}`,
    ]);
  }

  /**
   * Encuentra un usuario por su Email
   * @param email 
   * @returns user
   */
  async findByEmail(email: string) {
    const cacheKey = `user:email:${email}`;
    const cached = await this.cacheGet<any>(cacheKey);
    if (cached) return cached;

    // use .lean() to return a plain object (avoids needing to call toObject())
    const user = await this.userModel.findOne({ email }).lean().exec();
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const u: any = user;
    const safe = { ...u, password: u.password };
    this.cacheSet(cacheKey, safe, this.TTL_USER_SECONDS);

    this.cacheSet(`user:${u._id}`, { ...safe, password: undefined }, this.TTL_USER_SECONDS);
    return safe;
  }

  /**
 * Verifica si un usuario existe sin cargar el documento completo
 * @param id - ID del usuario
 * @returns true si existe, false si no
 */
  async userExists(id: string): Promise<boolean> {
    try {
      const count = await this.userModel.countDocuments({ _id: id }).exec();
      return count > 0;
    } catch (error) {
      return false;
    }
  }

}
