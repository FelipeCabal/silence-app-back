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

  async findAllUsers(userId: number, userQueries: UserQueries): Promise<User[]> {

    const userFriends = await this.findAllFriends(userId);
    const friendIds = userFriends.map((friend) => friend.user.id);

    let usersQuery = this.userRepository.createQueryBuilder('user');

    if (friendIds.length > 0) {
      usersQuery = usersQuery
        .orderBy(
          `CASE WHEN user.id IN (:...friendIds) THEN 1 ELSE 2 END`,
          'ASC'
        )
        .setParameter('friendIds', friendIds);
    } else {
      usersQuery = usersQuery.orderBy('user.id', 'ASC');
    }

    usersQuery = usersQuery.addOrderBy('user.nombre', 'ASC');

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


  async findAllFriends(userId: number): Promise<{ solicitudId: SolicitudAmistad; user: User }[]> {
    const friendsList = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect(
        'solicitudAmistad',
        'solicitud',
        '(solicitud.userEnvia = user.id OR solicitud.userRecibe = user.id) AND solicitud.status = :status',
        { status: 'A' }
      )
      .where('user.id != :userId', { userId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('solicitud.userEnvia = :userId', { userId })
            .orWhere('solicitud.userRecibe = :userId', { userId });
        })
      )
      .getMany()

    if (friendsList.length === 0) {
      return []
    }

    return await Promise.all(friendsList.map(async (friend) => {
      const solicitud = await this.solicitudAmistadServices.findOneRequestByIds(userId, friend.id);

      return {
        solicitudId: solicitud,
        user: friend
      };
    }));
  }


  async findOneUser(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['grupos', 'comunidades'],
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }
    return user
  }

  async update(id: number, updateUser: UpdateUserDto) {
    if (updateUser.password) {
      updateUser.password = await bcrypt.hashSync(updateUser.password, SALT_ROUNDS)
    }

    const newData = await this.userRepository.update(id, updateUser)

    if (newData.affected === 0) {
      throw new HttpException("User haven't been update", HttpStatus.CONFLICT)
    }
    return newData
  }

  async remove(id: number) {
    const userDelete = await this.userRepository.delete(id)

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
}
