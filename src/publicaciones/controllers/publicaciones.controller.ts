import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  NotFoundException,
  UseGuards,
  Query,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublicacionesService } from '../services/publicaciones.service';
import { CreatePublicacionDto } from '../dto/requests/create-publicacion.dto';
import { UpdatePublicacionDto } from '../dto/requests/update-publicacion.dto';
import { PublicacionResponseDto } from '../dto/responses/publicacion-response.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { PostQueries } from '../dto/requests/querie.dto';

@Controller('posts')
@ApiTags('Posts')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) { }

  /**
   * ENDPOINT to create a new post
   * @param createPublicacionesDto data to create a new post
   * @returns post newly created
   */
  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({
    status: 201,
    type: PublicacionResponseDto,
    description: 'The post has been successfully created.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  create(@Body() createPublicacionesDto: CreatePublicacionDto, @Request() req: any) {
    const user = req.user;
    return this.publicacionesService.create(createPublicacionesDto, user._id);
  }

  /**
   * ENDPOINT to get all posts
   * @returns array with all posts
   */
  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({
    status: 200,
    type: [PublicacionResponseDto],
    description: 'The posts have been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'No posts found' })
  async findAll() {
    const posts = await this.publicacionesService.findAll();

    if (posts.length === 0) throw new NotFoundException(`No posts found`);

    return posts;
  }

  /**
   * ENDPOINT to get all posts
   * @returns array with all posts
   */
  @Get('my/:userId')
  @ApiOperation({ summary: 'Get all user posts' })
  @ApiResponse({
    status: 200,
    type: [PublicacionResponseDto],
    description: 'The posts have been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'No posts found for the user.' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: "Número máximo de publicaciones a devolver"
  })
  @ApiQuery({
    name: 'esAnonimo',
    required: false,
    type: Boolean,
    description: 'Si se envía como true, inlcuir publicaciones anónimas'
  })
  @UseGuards(AuthGuard)
  async findByUser(
    @Request() req,
    @Param('userId') userId: string,
    @Query() postQueries: PostQueries
  ) {

    const user = req.user
    if (!user || !user._id) {
      throw new HttpException('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
    }

    return this.publicacionesService.findByUser(userId, postQueries, user._id);
  }

  /**
   * ENDPOINT to get one post
   * @param id from post that is searched
   * @returns post searched
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a post' })
  @ApiParam({ name: 'id', description: 'ID of the post to retrieve' })
  async findOne(@Param('id') id: string) {
    const post = await this.publicacionesService.findOne(id);

    if (!post) throw new NotFoundException(`Post with ID ${id} not found`);

    return post;
  }

  /**
   * ENDPOINT to update a post
   * @param id from post
   * @param updatePublicacionesDto update data
   * @returns post updated
   */
  @Patch(':postId')
  @ApiParam({ name: 'postId', description: 'ID of the post to update' })
  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({
    status: 200,
    type: PublicacionResponseDto,
    description: 'The post has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async update(
    @Param('postId') postId: string,
    @Body() updatePublicacionesDto: UpdatePublicacionDto,
    @Request() req: any
  ) {
    const userId = req.user
    const post = await this.publicacionesService.update(
      postId, updatePublicacionesDto, userId._id.toString()
    );

    if (!post) throw new NotFoundException(`Post with ID ${postId} not found`);

    return post;
  }

  /**
   * ENDPOINT to delete a post
   * @param id from post
   * @returns post deleted
   */
  @Delete(':id')
  @ApiParam({ name: 'id', description: 'ID of the post to delete' })
  @ApiOperation({ summary: 'Delete a post' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string, @Request() req: any) {
    const user = req.user
    const post = await this.publicacionesService.remove(id, user._id.toString());

    if (!post) throw new NotFoundException(`Post with ID ${id} not found`);

    return post;
  }
}
