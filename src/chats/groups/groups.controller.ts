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

  @Get(':id')
  @ApiOperation({ summary: 'Obtener grupo por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID del grupo' })
  async findById(@Param('id') id: string) {
    const data = await this.groupService.findById(id);
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
      msg: data.message,
      data,
    };
  }

  @Post(':groupId/mensajes')
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
