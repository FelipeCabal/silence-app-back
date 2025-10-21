import { Body, Controller, Post, Param, ParseIntPipe, Put, Delete, Patch, Request, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ComunidadesService } from '../services/comunity-chats.service';
import { Role } from 'src/config/enums/roles.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { ComunityAndGroupQueries } from '../dto/queries/comunities-queries.dto';

@Controller('community')
@ApiTags('comunidades')
@UseGuards(AuthGuard)
export class ComunidadesController {
    constructor(private readonly comunidadesService: ComunidadesService) { }

    @Get()
    @ApiOperation({ summary: 'obtener todas las comunidades del usuario logueado' })
    findAll(@Query() queries: ComunityAndGroupQueries) {
        return this.comunidadesService.findAll(queries);
    }

    @Get('user/:id')
    @ApiOperation({ summary: 'obtener todas las comunidades de un usuario' })
    findUsersComunity(
        @Param('id', ParseIntPipe) userId: number,
        @Query() queries: ComunityAndGroupQueries
    ) {
        return this.comunidadesService.findAllUserComunities(userId, queries)
    }

    @Get(':id')
    @ApiOperation({ summary: 'obtener una comunidad por el id' })
    findCommunity(
        @Param('id', ParseIntPipe) communityId: number,
    ) {
        return this.comunidadesService.findCommunityById(communityId)
    }

    @Post()
    @ApiOperation({ summary: 'Crear comunidad' })
    createCommunity(
        @Body() createCommunityDto: any,
        @Request() req: any
    ) {
        const ownerId = req.user.id;
        return this.comunidadesService.create(createCommunityDto, ownerId);
    }

    @Post(':id/miembros')
    @ApiOperation({ summary: 'Añadir miembro a comunidad' })
    addMember(
        @Param('id', ParseIntPipe) communityId: number,
        @Request() req: any
    ) {
        const userId = req.user.id;
        return this.comunidadesService.addMember(communityId, userId);
    }

    @Delete(':id/miembros/:userId')
    @ApiOperation({ summary: 'Eliminar miembro de comunidad' })
    removeMember(
        @Param('id', ParseIntPipe) communityId: number,
        @Param('userId', ParseIntPipe) userId: number,
        @Request() req: any
    ) {
        const executorId = req.user.id;
        return this.comunidadesService.removeMember(communityId, userId, executorId);
    }

    @Patch(':id/administradores/:userId')
    @ApiOperation({ summary: 'Actualizar rol de miembro' })
    toggleAdminRole(
        @Param('id', ParseIntPipe) communityId: number,
        @Param('userId', ParseIntPipe) userId: number,
        @Body('rol') role: Role,
        @Request() req: any
    ) {
        const executorId = req.user.id;
        return this.comunidadesService.toggleAdminRole(communityId, userId, role, executorId);
    }
}
