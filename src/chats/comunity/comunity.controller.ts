import { Body, Controller, Post, Param, ParseIntPipe, Put, Delete, Patch, Request, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ComunidadesService } from '../services/comunity-chats.service';
import { Role } from 'src/config/enums/roles.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { ComunityAndGroupQueries } from '../dto/queries/comunities-queries.dto';
import { CommunityService } from './community.service';

@Controller('community')
@ApiTags('comunidades')
@UseGuards(AuthGuard)
export class ComunidadesController {
  constructor(private readonly communityService: CommunityService) {}

    @Get()
    @ApiOperation({ summary: 'obtener todas las comunidades del usuario logueado' })
    findAll() {
        return this.communityService.findAll();
    }

    @Get('user/:id')
    @ApiOperation({ summary: 'obtener todas las comunidades de un usuario' })
    findUsersComunity(
        @Param('id', ParseIntPipe) userId: string,
        @Query() queries: ComunityAndGroupQueries
    ) {
   //     return this.communityService.addMiembro(userId, queries)
    }

    @Get(':id')
    @ApiOperation({ summary: 'obtener una comunidad por el id' })
    findCommunity(
        @Param('id', ParseIntPipe) communityId: number,
    ) {
    //    return this.communityService(communityId)
    }

    @Post()
    @ApiOperation({ summary: 'Crear comunidad' })
    createCommunity(
        @Body() createCommunityDto: any,
        @Request() req: any
    ) {
        const ownerId = req.user.id;
        return this.communityService.addMiembro(createCommunityDto, ownerId);
    }

    @Post(':id/miembros')
    @ApiOperation({ summary: 'Añadir miembro a comunidad' })
    addMember(
        @Param('id', ParseIntPipe) communityId: number,
        @Request() req: any
    ) {
        const userId = req.user.id;
   //     return this.communityService.create(communityId, userId);
    }

    @Delete(':id/miembros/:userId')
    @ApiOperation({ summary: 'Eliminar miembro de comunidad' })
    removeMember(
        @Param('id', ParseIntPipe) communityId: number,
        @Param('userId', ParseIntPipe) userId: number,
        @Request() req: any
    ) {
        const executorId = req.user.id;
      //  return this.communityService.remove(communityId, userId, executorId);
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
       // return this.communityService.toggleAdminRole(communityId, userId, role, executorId);
    }
}
