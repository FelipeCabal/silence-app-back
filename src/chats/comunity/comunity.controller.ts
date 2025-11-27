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
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateComunidadDto } from '../request/community.dto';
import { CommunityService } from './community.service';
import { CreateCommunityMessageDto } from '../dto/comunidadesDto/create-community-message.dto';

@Controller('community')
@ApiTags('community')
export class ComunidadesController {
  constructor(private readonly communityService: CommunityService) {}

  @ApiOperation({
    summary: 'Obtener todas las comunidades del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Comunidades obtenidas correctamente',
    schema: {
      example: {
        err: false,
        msg: 'Comunidades obtenidas correctamente',
        data: [
          {
            id: '691c0aa17b21eb32451b386f',
            nombre: 'Comunidad Prueba',
            imagen: 'string',
            lastMessage: 'Hola a todos mis amigos!',
            lastMessageDate: '2025-11-22T05:02:51.751Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - token faltante o inválido',
  })
  @ApiResponse({ status: 404, description: 'No se encontraron comunidades' })
  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Elementos por página',
    example: 10,
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

  @ApiParam({ name: 'id', description: 'ID de la comunidad' })
  @ApiOperation({ summary: 'Obtener una comunidad por ID' })
  @ApiResponse({
    status: 200,
    description: 'Comunidad obtenida correctamente',
    schema: {
      example: {
        err: false,
        msg: 'Comunidad obtenida correctamente',
        data: {
          id: '691c0aa17b21eb32451b386f',
          nombre: 'Comunidad Prueba',
          imagen: 'string',
          lastMessage: 'Hola a todos mis amigos!',
          lastMessageDate: '2025-11-22T05:02:51.751Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Comunidad no encontrada' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - token faltante o inválido',
  })
  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener comunidad por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la comunidad' })
  async findById(@Param('id') id: string, @Req() req: any) {
    const userId = req.user._id;

    const data = await this.communityService.findById(id, userId);
    return {
      err: false,
      msg: 'Comunidad obtenida correctamente',
      data,
    };
  }

  @ApiOperation({ summary: 'Crear una nueva comunidad' })
  @ApiBody({ type: CreateComunidadDto })
  @ApiResponse({
    status: 201,
    description: 'Comunidad creada correctamente',
    schema: {
      example: {
        err: false,
        msg: 'Comunidad creada correctamente',
        data: {
          id: '6927cd8c8aab30913b54f3d4',
          nombre: 'Comunidad Backend',
          descripcion:
            'Espacio para aprender y compartir sobre NestJS y Swagger',
          imagen: 'https://mi-servidor.com/imagenes/comunidad-backend.png',
          miembros: [
            {
              user: {
                _id: '691bf9c02e5f2fe2ab3bd061',
                nombre: 'Felipe',
                avatar: null,
              },
              rol: 'admin',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos en el cuerpo de la solicitud',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - token faltante o inválido',
  })
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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

  @ApiParam({ name: 'id', description: 'ID de la comunidad' })
  @ApiOperation({ summary: 'Agregar un mensaje a la comunidad' })
  @ApiResponse({
    status: 201,
    description: 'Mensaje agregado correctamente a la comunidad',
    schema: {
      example: {
        err: false,
        msg: 'Mensaje agregado correctamente a la comunidad',
        data: {
          _id: '6927cd8c8aab30913b54f3d4',
          mensaje: 'bebe te amo',
          remitente: '691bf9c02e5f2fe2ab3bd061',
          fecha: '2025-11-27T04:11:34.337Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos en el cuerpo de la solicitud',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - token faltante o inválido',
  })
  @ApiResponse({ status: 404, description: 'Comunidad no encontrada' })
  @Post(':id/messages')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
