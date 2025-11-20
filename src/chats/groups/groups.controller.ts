import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Request,
  UseGuards,
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
    const creatorId = req.user.id;
    const data = await this.groupService.create(dto, creatorId);

    return {
      err: false,
      msg: 'Grupo creado correctamente',
      data,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los grupos' })
  async findAll() {
    const data = await this.groupService.findAll();
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
  async remove(@Param('id') id: string) {
    const data = await this.groupService.remove(id);
    return {
      err: false,
      msg: 'Grupo eliminado correctamente',
      data,
    };
  }
}
