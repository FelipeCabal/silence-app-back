import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { CreateComunidadDto } from './dto/create-community.dto';
import { CommunityService } from './community.service';

@Controller('comunidades')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post(':userId')
  async create(@Param('userId') userId:string ,@Body() dto: CreateComunidadDto) {
    return this.communityService.create(dto, userId);
  }

  @Get()
  async findAll() {
    return this.communityService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.communityService.findById(id);
  }

  @Post(':id/miembros')
  async addMiembro(@Param('id') id: string, @Body('usuarioId') usuarioId: string) {
    return this.communityService.addMiembro(id, usuarioId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.communityService.remove(id);
  }
}
