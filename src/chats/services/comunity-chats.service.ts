import { Injectable, NotFoundException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comunidades } from '../entities/chats.entity';
import { MiembrosComunidades } from '../entities/miembrosComunidad.entity';
import { Role } from 'src/config/enums/roles.enum';
import { UsersService } from 'src/users/services/users.service';
import { ComunityAndGroupQueries } from '../dto/queries/comunities-queries.dto';

@Injectable()
export class ComunidadesService {
    constructor(
        @InjectRepository(Comunidades)
        private readonly comunidadesRepository: Repository<Comunidades>,

        @InjectRepository(MiembrosComunidades)
        private readonly miembrosRepository: Repository<MiembrosComunidades>,

        private readonly usersService: UsersService,
    ) { }

    async create(createCommunityDto: Partial<Comunidades>, ownerId: string): Promise<Comunidades> {
        const owner = await this.usersService.findOneUser(ownerId)

        const newCommunity = this.comunidadesRepository.create({
            ...createCommunityDto,
        });

        const savedCommunity = await this.comunidadesRepository.save(newCommunity);

        const ownerMembership = this.miembrosRepository.create({
            comunidad: savedCommunity,
            usuario: owner,
            rol: Role.Owner,
        });

        await this.miembrosRepository.save(ownerMembership);

        return savedCommunity;
    }

    async findAll(ComunityQueries: ComunityAndGroupQueries): Promise<Comunidades[]> {
        const queryBuilder = this.comunidadesRepository.createQueryBuilder('comunity');

        if (ComunityQueries.search) {
            queryBuilder.where('comunity.nombre ILIKE :search', {
                search: `%${ComunityQueries.search}%`,
            }).orWhere('comunity.descripcion ILIKE :search', {
                search: `%${ComunityQueries.search}%`,
            });
        }

        queryBuilder.addOrderBy('comunity.nombre', 'ASC');

        if (ComunityQueries.limit && Number.isInteger(ComunityQueries.limit)) {
            queryBuilder.take(ComunityQueries.limit);
        }

        const results = await queryBuilder.getMany();
        if (results.length === 0) {
            throw new HttpException('No se encontraron comunidades que coincidan con la búsqueda.', HttpStatus.NOT_FOUND);
        }

        return results;
    }

    async findAllUserComunities(userId: number, ComunityQueries: ComunityAndGroupQueries): Promise<MiembrosComunidades[]> {
        const queryBuilder = this.miembrosRepository.createQueryBuilder('miembro')
            .leftJoinAndSelect('miembro.comunidad', 'comunidad')
            .where('miembro.usuario.id = :userId', { userId });

        if (ComunityQueries.search) {
            queryBuilder.andWhere('comunidad.nombre ILIKE :search', {
                search: `%${ComunityQueries.search}%`,
            }).orWhere('comunidad.descripcion ILIKE :search', {
                search: `%${ComunityQueries.search}%`,
            });
        }

        queryBuilder.addOrderBy('comunidad.nombre', 'ASC');

        if (ComunityQueries.limit && Number.isInteger(ComunityQueries.limit)) {
            queryBuilder.take(ComunityQueries.limit);
        }

        const results = await queryBuilder.getMany();
        if (results.length === 0) {
            throw new HttpException('No se encontraron comunidades para el usuario.', HttpStatus.NOT_FOUND);
        }

        return results;
    }


    async addMember(communityId: number, userId: String): Promise<void> {
        const comunidad = await this.findCommunityById(communityId);
        const user = await this.usersService.findOneUser(userId)

        const existingMember = await this.miembrosRepository.findOne({
            where: { comunidad: { id: communityId }, usuario: { id: userId } },
        });

        if (existingMember) {
            throw new ForbiddenException('El usuario ya es miembro de la comunidad.');
        }

        const newMember = this.miembrosRepository.create({
            comunidad,
            usuario: user,
            rol: Role.Member,
        });

        await this.miembrosRepository.save(newMember);
    }

    async removeMember(communityId: number, userId: number, executorId: number): Promise<void> {
        const membership = await this.miembrosRepository.findOne({
            where: { comunidad: { id: communityId }, usuario: { id: userId } },
        });

        if (!membership) {
            throw new NotFoundException('El usuario no es miembro de esta comunidad.');
        }

        const executorMembership = await this.miembrosRepository.findOne({
            where: { comunidad: { id: communityId }, usuario: { id: executorId } },
        });

        if (!executorMembership || ![Role.Owner, Role.Admin].includes(executorMembership.rol)) {
            throw new ForbiddenException('No tienes permisos para eliminar a este miembro.');
        }

        await this.miembrosRepository.remove(membership);
    }

    async toggleAdminRole(communityId: number, userId: number, role: Role, executorId: number): Promise<void> {
        const membership = await this.miembrosRepository.findOne({
            where: { comunidad: { id: communityId }, usuario: { id: userId } },
        });

        if (!membership) {
            throw new NotFoundException('El usuario no es miembro de esta comunidad.');
        }

        const executorMembership = await this.miembrosRepository.findOne({
            where: { comunidad: { id: communityId }, usuario: { id: executorId } },
        });

        if (!executorMembership || executorMembership.rol !== Role.Owner) {
            throw new ForbiddenException('No tienes permisos para cambiar el rol de este miembro.');
        }

        membership.rol = role;
        await this.miembrosRepository.save(membership);
    }

    async findCommunityById(id: number): Promise<Comunidades> {
        const community = await this.comunidadesRepository.findOne({
            where: { id },
            relations: ['miembros', 'miembros.usuario'],
        });

        if (!community) {
            throw new NotFoundException('Comunidad no encontrada.');
        }

        return community;
    }
}
