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
  Query,
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
import { CreateCommunityMessageDto } from '../dto/comunidadesDto/create-community-message.dto';

@Controller('community')
@ApiTags('community')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ComunidadesController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener comunidades a las que pertenece el usuario autenticado',
  })
  async findAll(@Req() req: any) {
    const userId = req.user._id;

    const data = await this.communityService.findAllByUser(userId);

    return {
      err: false,
      msg: 'Comunidades obtenidas correctamente',
      data,
    };
  }

  @Get('all')
  @ApiOperation({
    summary: 'Obtener todas las comunidades con búsqueda y paginación',
  })
  async getAllCommunities(
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const data = await this.communityService.getAllCommunities(
      search,
      page,
      limit,
    );

    return {
      err: false,
      msg: 'Comunidades obtenidas correctamente',
      ...data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener comunidad por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la comunidad' })
  async findById(@Param('id') id: string,@Req() req: any) {
        const userId = req.user._id;

    const data = await this.communityService.findById(id,userId);
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
    const userId = req.user._id;
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
    const userId = req.user._id;
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
    const requesterId = req.user?._id;
    await this.communityService.removeMember(communityId, userId, requesterId);
    return {
      err: false,
      msg: 'Miembro eliminado correctamente por un administrador',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar comunidad' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la comunidad' })
  async deleteCommunity(@Param('id') id: string, @Request() req: any) {
    const userId = req.user._id;
    const data = await this.communityService.removeCommunity(id, userId);
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
    const userId = req.user?._id;

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

  @Post(':id/messages')
  @ApiOperation({ summary: 'Agregar un mensaje a la comunidad' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la comunidad' })
  @ApiBody({ type: CreateCommunityMessageDto })
  async addMessageToCommunity(
    @Param('id') id: string,
    @Body() dto: CreateCommunityMessageDto,
    @Req() req: any,
  ) {
    const userId = req.user._id;
    const data = await this.communityService.addMessage(
      id,
      userId,
      dto.message,
    );
    return {
      err: false,
      msg: 'Mensaje agregado correctamente a la comunidad',
      data,
    };
  }
}
