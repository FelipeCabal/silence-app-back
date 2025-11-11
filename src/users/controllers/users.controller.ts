import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UserQueries } from '../dto/querie.dto';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async findAllUsers(
    @Request() req: any,
    @Query() userQueries: UserQueries,
  ) {
    const userId = req.user.id;
    return this.usersService.findAllUsers(userId, userQueries);
  }

  //@Post()
  //@ApiOperation({ summary: 'Create a new User' })
  ////@ApiResponse({ status: 200, description: '' })
  //async create(@Body() createUser: CreateUserDto) {
  //  return this.usersService.createUser(createUser);
  //}

  @Get(':id/friends')
  @ApiOperation({ summary: "Get all friends from an user" })
  findAll(
    @Request() req: any
  ) {
    const userId = req.user
    return this.usersService.findAllFriends(userId.id);
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get an User' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOneUser(id);
  }


  @Patch(':id')
  @ApiOperation({ summary: "Update the User's info" })
  async update(@Param('id') id: string, @Body() updateUser: UpdateUserDto) {
    return this.usersService.update(id, updateUser);
  }


  @Delete(':id')
  @ApiOperation({ summary: "Delete an User" })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
