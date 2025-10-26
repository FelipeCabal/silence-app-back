import { forwardRef, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from 'src/config/constants/bycript.constants';
import { SolicitudAmistad } from '../entities/solicitud.entity';
import { SolicitudesAmistadService } from './solicitudesAmistad.service';
import { UserQueries } from '../dto/querie.dto';
import { InjectModel } from '@nestjs/mongoose';
import { userSchema } from '../userSchema/users.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(userSchema.name) private readonly userModel: Model<userSchema>,

    @Inject(forwardRef(() => SolicitudesAmistadService))
    private readonly solicitudAmistadServices: SolicitudesAmistadService,
  ) { }

  /**
   * Función para crear un nuevo usuario.
   * @param createUser 
   * @returns User
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
  async findAllUsers(userId: String, userQueries: UserQueries): Promise<userSchema[]> {
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



  async findAllFriends(userId: String) {
    //
  }

  /**
   * Función para buscar sólo un usuario ¿
   * @param id 
   * @returns Usuario
   */
  async findOneUser(id: String) {
    const user = await this.userModel.findById(id).select('-password').exec();

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user
  }

  /**
   * Función para actualizar un usuario
   * @param id 
   * @param updateUser 
   * @returns usuario actualizado.
   */
  async update(id: String, updateUser: UpdateUserDto) {
    if (updateUser.password) {
      updateUser.password = await bcrypt.hashSync(updateUser.password, SALT_ROUNDS);
    }

    const newData = await this.userModel.findByIdAndUpdate(id, updateUser, {
      new: true,
    });

    if (!newData) {
      throw new HttpException("User haven't been update", HttpStatus.CONFLICT);
    }
    return newData;
  }

  /**
   * Función para eliminar un usuario
   * @param id 
   * @returns usuario eliminado
   */
  async remove(id: String) {
    const userDelete = await this.userModel.findByIdAndDelete(id);

    if (!userDelete) {
      throw new HttpException("User can't be delete", HttpStatus.CONFLICT)
    }
    return userDelete;
  }

  /**
   * Encuentra un usuario por su Email
   * @param email 
   * @returns user
   */
  async findByEmail(email: String) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

}
