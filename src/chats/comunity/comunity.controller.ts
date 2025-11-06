import {
  Body,
  Controller,
  Post,
  Param,
  Delete,
  Request,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateComunidadDto } from '../request/community.dto';
import { CommunityService } from './community.service';

@Controller('community')
@ApiTags('community')
@UseGuards(AuthGuard)
export class ComunidadesController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las comunidades' })
  async findAll() {
    const data = await this.communityService.findAll();
    return {
      err: false,
      msg: 'Comunidades obtenidas correctamente',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener comunidad por ID' })
  async findById(@Param('id') id: string) {
    const data = await this.communityService.findById(id);
    return {
      err: false,
      msg: 'Comunidad obtenida correctamente',
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Crear una comunidad' })
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
  async addMember(@Param('id') communityId: string, @Request() req: any) {
    const userId = req.user.id;
    await this.communityService.addMiembro(communityId, userId);
    return {
      err: false,
      msg: 'Miembro agregado correctamente',
      data: null,
    };
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Eliminar miembro de comunidad' })
  async removeMember(
    @Param('id') communityId: string,
    @Param('userId') userId: string,
  ) {
    await this.communityService.remove(communityId);
    return {
      err: false,
      msg: 'Miembro eliminado correctamente',
      data: null,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar comunidad' })
  async deleteCommunity(@Param('id') id: string) {
    const data = await this.communityService.remove(id);
    return {
      err: false,
      msg: 'Comunidad eliminada correctamente',
      data,
    };
  }
}
