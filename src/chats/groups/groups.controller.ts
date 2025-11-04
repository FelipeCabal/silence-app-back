import { Controller, Post, Get, Param, Body, Delete } from '@nestjs/common';
import { GroupService } from './groups.service';
import { CreateGrupoDto } from './dto/create-group.dto';

@Controller('grupos')
export class GroupsController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  async create(@Body() dto: CreateGrupoDto) {
    const creatorId = '67250f23b35b4a6d94b8d01f';
    return this.groupService.create(dto, creatorId);
  }

  @Post(':id/invitar')
  async invite(@Param('id') grupoId: string, @Body('userId') userId: string) {
    return this.groupService.invite(grupoId, userId);
  }

  @Get()
  async findAll() {
    return this.groupService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.groupService.findById(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.groupService.remove(id);
  }
}
