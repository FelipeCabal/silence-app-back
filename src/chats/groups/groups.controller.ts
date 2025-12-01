import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Request,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GroupService } from './groups.service';
import { CreateGrupoDto } from '../request/create-group.dto';

@Controller('groups')
@ApiTags('groups')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class GroupsController {
  constructor(private readonly groupService: GroupService) {}

  @ApiResponse({
    status: 201,
    description: 'Grupo creado correctamente',
    schema: {
      example: {
        err: false,
        msg: 'Grupo creado correctamente',
        data: {
          id: '6927b330a5a6bb8c46bad48d',
          nombre: 'Grupo Backend',
          descripcion: 'Grupo de estudio para NestJS y Swagger',
          imagen: 'https://mi-servidor.com/imagenes/grupo-backend.png',
          members: [
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
  @ApiOperation({ summary: 'Crear grupo' })
  @ApiBody({ type: CreateGrupoDto })
  async create(@Body() dto: CreateGrupoDto, @Request() req: any) {
    const creatorId = req.user._id;
    const data = await this.groupService.create(dto, creatorId);

    return {
      err: false,
      msg: 'Grupo creado correctamente',
      data,
    };
  }

  @ApiResponse({
    status: 200,
    description: 'Grupos obtenidos correctamente',
    schema: {
      example: {
        err: false,
        msg: 'Grupos obtenidos correctamente',
        data: [
          {
            id: '691c0b947b21eb32451b3894',
            nombre: 'Grupo Prueba',
            imagen: 'string',
            lastMessage: 'Nataliaaaaaaa!',
            lastMessageDate: '2025-11-22T05:31:24.795Z',
          },
          {
            id: '6927b330a5a6bb8c46bad48d',
            nombre: 'Grupo Backend',
            imagen: 'https://mi-servidor.com/imagenes/grupo-backend.png',
            lastMessage: null,
            lastMessageDate: '2025-11-27T02:10:56.030Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - token faltante o inválido',
  })
  @Get()
  @ApiOperation({
    summary: 'Obtener los grupos a los que pertenece el usuario autenticado',
  })
  async findAll(@Req() req: any) {
    const userId = req.user?._id;
    const data = await this.groupService.findAll(userId);

    return {
      err: false,
      msg: 'Grupos obtenidos correctamente',
      data,
    };
  }

  @ApiResponse({
    status: 200,
    description: 'Grupo obtenido correctamente',
    schema: {
      example: {
        err: false,
        msg: 'Grupo obtenido correctamente',
        data: {
          id: '691c0b947b21eb32451b3894',
          nombre: 'Grupo Prueba',
          descripcion: 'Este es un grupo de prueba',
          imagen: 'string',
          members: [
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
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - token faltante o inválido',
  })
  @Get(':id')
  @ApiOperation({ summary: 'Obtener grupo por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID del grupo' })
  async findById(@Param('id') id: string, @Req() req: any) {
    const userId = req.user._id;

    const data = await this.groupService.findById(id, userId);

    return {
      err: false,
      msg: 'Grupo obtenido correctamente',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar grupo' })
  @ApiParam({ name: 'id', type: String, description: 'ID del grupo' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user._id;

    const data = await this.groupService.remove(id, userId);

    return {
      err: false,
      msg: 'Grupo eliminado correctamente',
      data,
    };
  }

  @Delete(':id/leave')
  @ApiOperation({
    summary:
      'Salir del grupo (si eres admin se reasigna el rol si hay más miembros)',
  })
  @ApiParam({ name: 'id', type: String, description: 'ID del grupo' })
  async leaveGroup(@Param('id') id: string, @Req() req: any) {
    const userId = req.user._id;

    const data = await this.groupService.leaveGroup(id, userId);
    return {
      err: false,
      msg: data.message,
      data,
    };
  }

  @Delete(':groupId/members/:memberId')
  @ApiOperation({
    summary: 'Eliminar miembro de un grupo (solo administradores)',
  })
  @ApiParam({ name: 'groupId', type: String, description: 'ID del grupo' })
  @ApiParam({
    name: 'memberId',
    type: String,
    description: 'ID del miembro a eliminar',
  })
  async removeMember(
    @Param('groupId') groupId: string,
    @Param('memberId') memberId: string,
    @Req() req: any,
  ) {
    const requesterId = req.user._id;

    const data = await this.groupService.removeMember(
      groupId,
      memberId,
      requesterId,
    );

    return {
      err: false,
      data,
    };
  }

  @ApiResponse({
    status: 200,
    description: 'Mensaje enviado/obtenido correctamente',
    schema: {
      example: {
        status: 'success',
        data: {
          _id: '691c0b947b21eb32451b3894',
          mensaje: 'Hola a todos!',
          remitente: '691bf9c02e5f2fe2ab3bd061',
          fecha: '2025-11-27T03:07:53.536Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos en la solicitud' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - token faltante o inválido',
  })
  @ApiResponse({ status: 404, description: 'Mensaje o recurso no encontrado' })
  @Post(':groupId/messages')
  @ApiOperation({ summary: 'Agregar un mensaje a un grupo' })
  @ApiParam({
    name: 'groupId',
    type: String,
    description: 'ID del grupo al que se enviará el mensaje',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Hola a todos!',
          description: 'Contenido del mensaje a enviar',
        },
      },
      required: ['message'],
    },
  })
  @Post(':groupId/messages')
  @ApiOperation({ summary: 'Agregar un mensaje a un grupo' })
  @ApiParam({
    name: 'groupId',
    type: String,
    description: 'ID del grupo al que se enviará el mensaje',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Hola a todos!',
          description: 'Contenido del mensaje a enviar',
        },
      },
      required: ['message'],
    },
  })
  async addMessage(
    @Param('groupId') groupId: string,
    @Body('message') message: string,
    @Req() req: any,
  ) {
    const userId = req.user._id;

    if (!message || message.trim() === '') {
      throw new ForbiddenException('El mensaje no puede estar vacío.');
    }

    const nuevoMensaje = await this.groupService.addMessage(
      groupId,
      userId,
      message,
    );

    return {
      status: 'success',
      data: nuevoMensaje,
    };
  }
}
