import {
  Body,
  Controller,
  Post,
  Param,
  Delete,
  Request,
  Get,
  UseGuards,

  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateComunidadDto } from '../request/community.dto';
import { CommunityService } from './community.service';

@Controller('community')
@ApiTags('community')

@UseGuards(AuthGuard)
@ApiBearerAuth()

export class ComunidadesController {
  constructor(private readonly communityService: CommunityService) {}

@Get()
@ApiOperation({ summary: 'Obtener comunidades a las que pertenece el usuario autenticado' })
async findAll(@Req() req: any) {
  const userId = req.user.id; 

  const data = await this.communityService.findAll(userId);

  return {
    err: false,
    msg: 'Comunidades obtenidas correctamente',
    data,
  };
}


  @Get(':id')
  @ApiOperation({ summary: 'Obtener comunidad por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la comunidad' })
  async findById(@Param('id') id: string) {
    const data = await this.communityService.findById(id);
    return {
      err: false,
      msg: 'Comunidad obtenida correctamente',
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Crear comunidad' })
  @ApiBody({ type: CreateComunidadDto })
  async createCommunity(@Body() dto: CreateComunidadDto, @Request() req: any) {
    const userId = req.user.id;
    const data = await this.communityService.create(dto, userId);
    return {
      err: false,
      msg: 'Comunidad creada correctamente',
      data,
    };
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Unirse a una comunidad' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la comunidad' })
  async addMember(@Param('id') communityId: string, @Request() req: any) {
    const userId = req.user.id;
    await this.communityService.addMiembro(communityId, userId);
    return {
      err: false,
      msg: 'Te has unido a la comunidad',
      data: null,
    };
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Eliminar miembro de una comunidad' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la comunidad' })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'ID del miembro a eliminar',
  })
  async removeMember(
    @Param('id') communityId: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    const requesterId = req.user?.id;
    await this.communityService.remove(communityId, userId, requesterId);
    return {
      err: false,
      msg: 'Miembro eliminado correctamente por un administrador',
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar comunidad' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la comunidad' })
  async deleteCommunity(@Param('id') id: string) {
    const data = await this.communityService.removeCommunity(id);
    return {
      err: false,
      msg: 'Comunidad eliminada correctamente',
      data,
    };
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Salir de una comunidad' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la comunidad' })
  async leaveCommunity(@Param('id') communityId: string, @Req() req: any) {
    const userId = req.user?.id;

    const result = await this.communityService.leaveCommunity(
      communityId,
      userId,
    );

    return {
      err: false,
      msg: result.message,
      data: null,
    };
  }

}
