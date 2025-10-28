import { forwardRef, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Brackets, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from 'src/config/constants/bycript.constants';
import { SolicitudAmistad } from '../entities/solicitud.entity';
import { SolicitudesAmistadService } from './solicitudesAmistad.service';
import { UserQueries } from '../dto/querie.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(forwardRef(() => SolicitudesAmistadService))
    private readonly solicitudAmistadServices: SolicitudesAmistadService,
  ) { }

  async createUser(createUser: CreateUserDto) {
    createUser.password = bcrypt.hashSync(createUser.password, SALT_ROUNDS)
    const exists = await this.userRepository.findOne({
      where: { email: createUser.email }
    });
    if (exists) {
      throw new HttpException('user already exist', HttpStatus.CONFLICT)
    };
    const user = await this.userRepository.save(createUser);

    return user;
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
      usersQuery = usersQuery.andWhere(
        'user.nombre ILIKE :search OR user.email ILIKE :search',
        { search: `%${userQueries.search}%` }
      );
    }

    if (userQueries.country) {
      usersQuery = usersQuery.andWhere('user.pais ILIKE :country', { country: userQueries.country });
    }

    if (userQueries.limit) {
      usersQuery = usersQuery.take(userQueries.limit);
    }

    const users = await usersQuery.getMany();

    if (users.length === 0) {
      throw new NotFoundException('No se encontraron usuarios que coincidan con la búsqueda.');
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
  async update(id: String, updateUser: UpdateUserDto) {
    if (updateUser.password) {
      updateUser.password = await bcrypt.hashSync(updateUser.password, SALT_ROUNDS)
    }

    const newData = await this.userRepository.update(id, updateUser)

    if (newData.affected === 0) {
      throw new HttpException("User haven't been update", HttpStatus.CONFLICT)
    }
    return newData
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
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
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
