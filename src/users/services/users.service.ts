import { forwardRef, HttpException, HttpStatus, Inject, Injectable, } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from 'src/config/constants/bycript.constants';
import { SolicitudesAmistadService } from './solicitudesAmistad.service';
import { UserQueries } from '../dto/querie.dto';
import { userSchema } from '../entities/users.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(userSchema.name) private readonly userModel: Model<userSchema>,
    @Inject(forwardRef(() => SolicitudesAmistadService))
    private readonly solicitudAmistadServices: SolicitudesAmistadService,
  ) { }

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
    return user.save();
  }

  /**
   * Función para buscar a todos los usuarios usando queries / filtros
   * @param userId 
   * @param userQueries 
   * @returns lista de usuarios que cumplen con los criterios de búsqueda
   */
  async findAllUsers(userId: string, userQueries: UserQueries): Promise<userSchema[]> {
    let query: any = {};

    // Filtro por nombre o email
    if (userQueries.search) {
      query.$or = [
        { nombre: { $regex: userQueries.search, $options: 'i' } },
        { email: { $regex: userQueries.search, $options: 'i' } },
      ];
    }

    // Filtro por país
    if (userQueries.country) {
      query.pais = { $regex: userQueries.country, $options: 'i' };
    }

    const users = await this.userModel
      .find(query)
      .limit(userQueries.limit || 0)
      .sort({ nombre: 1 })
      .lean();

    if (!users.length) {
      throw new HttpException(
        'No se encontraron usuarios que coincidan con la búsqueda.', HttpStatus.NOT_FOUND
      );
    }

    return users;
  }

  async findAllFriends(userId: string) {
    // Primero obtenemos las solicitudes aceptadas
    const acceptedRequests = await this.solicitudAmistadServices.findAcceptedFriendships(userId);

    if (!acceptedRequests.length) {
      return [];
    }

    // Extraemos los "otros usuarios" (los amigos)
    const amigos = acceptedRequests.map(request => {
      const isSender = request.userEnvia._id.toString() === userId;
      const amigo = isSender ? request.userRecibe : request.userEnvia;

      return amigo
    });

    return amigos;
  }

  /**
   * Función para buscar sólo un usuario ¿
   * @param id 
   * @returns Usuario
   */
  async findOneUser(id: string) {
    const user = await this.userModel.findById(id).select('-password').exec();

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }
    return user
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

    const updated = await this.userModel.findByIdAndUpdate(id, updateUser, {
      new: true,
    });

    if (!updated) {
      throw new HttpException("User hasn't been updated", HttpStatus.CONFLICT);
    }

    return updated;
  }

  /**
   * Función para eliminar un usuario
   * @param id 
   * @returns usuario eliminado
   */
  async remove(id: string) {
    const userDelete = await this.userModel.findByIdAndDelete(id);

    if (!userDelete) {
      throw new HttpException("User can't be delete", HttpStatus.CONFLICT)
    }
  }

  /**
   * Encuentra un usuario por su Email
   * @param email 
   * @returns user
   */
  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

}
