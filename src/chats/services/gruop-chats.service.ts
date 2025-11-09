/* import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grupos } from '../entities/chats.entity';
import { User } from 'src/users/entities/user.entity';
import { createGrupoDto } from '../dto/GruposDto/create-grupos.dto';
import { updateGruposDto } from '../dto/GruposDto/update-grupos.dto';
import { UsersService } from 'src/users/services/users.service';
import { ComunityAndGroupQueries } from '../dto/queries/comunities-queries.dto';
import { UserSchema } from 'src/users/entities/users.schema';

@Injectable()
export class GroupChatsService {
  constructor(
    @InjectRepository(Grupos)
    private readonly groupRepository: Repository<Grupos>,

    private readonly usersServices: UsersService,
  ) {}

  async create(createChatDto: createGrupoDto, userId: string): Promise<Grupos> {
    const newGroup = this.groupRepository.create(createChatDto);
    const user = await this.usersServices.findOneUser(userId);

    try {
      await this.groupRepository.save(newGroup);
      await this.addUserToGroup(newGroup.id, user);
    } catch {
      throw new HttpException(
        'No fue posible agregar el usuario creador al grupo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return newGroup;
  }

  async findAllGroups(userId, GroupQueries: ComunityAndGroupQueries) {
    const user = await this.usersServices.findOneUser(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    let grupos = user.grupos;

    if (GroupQueries.search) {
      grupos = grupos.filter(
        (grupo) =>
          grupo.nombre
            .toLowerCase()
            .includes(GroupQueries.search.toLowerCase()) ||
          grupo.descripcion
            .toLowerCase()
            .includes(GroupQueries.search.toLowerCase()),
      );
    }

    grupos = grupos.sort((a, b) => a.nombre.localeCompare(b.nombre));

    if (GroupQueries.limit && Number.isInteger(GroupQueries.limit)) {
      grupos = grupos.slice(0, GroupQueries.limit);
    }

    if (grupos.length === 0) {
      throw new HttpException(
        'No se encontraron grupos para el usuario.',
        HttpStatus.NOT_FOUND,
      );
    }

    return grupos;
  }

  async findGroupById(id: string): Promise<Grupos> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['miembros'],
    });

    if (!group) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado.`);
    }

    return group;
  }
 */
/*   async addUserToGroup(groupId: number, user: UserSchema) { */
//  const group = await this.findGroupById(groupId);
//
//  if (group.miembros.some((miembro) => miembro.id === user.id)) {
//      throw new NotFoundException(`El usuario ya pertenece al grupo.`);
//  }
//
//  group.miembros.push(user);
//  return await this.groupRepository.save(group);
/*   } */

/* async removeUserFromGroup(groupId: number, userId: String): Promise<Grupos> {
         const group = await this.findGroupById(groupId);
         const user = group.miembros.find((miembro) => miembro.id === userId);
 
         if (!user) {
             throw new NotFoundException(`El usuario no está en este grupo.`);
         }
 
         group.miembros = group.miembros.filter((miembro) => miembro.id !== userId);
         return await this.groupRepository.save(group);
     }
 
     async update(id: number, updateChatDto: updateGruposDto): Promise<Grupos> {
         const group = await this.findGroupById(id);
 
         Object.assign(group, updateChatDto);
         return await this.groupRepository.save(group);
     }
 
     async remove(id: number): Promise<void> {
         const group = await this.findGroupById(id);
         await this.groupRepository.remove(group);
     } */
/* } */
