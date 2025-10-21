import { Controller, Post, Param, UseGuards, Req, Get } from '@nestjs/common';
import { LikesService } from './likes.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('likes')
@ApiTags('likes')
@UseGuards(AuthGuard)
export class LikesController {
  constructor(private readonly likesService: LikesService) { }

  @Post(':postId')
  @ApiOperation({ summary: "Toggle like" })
  async manejoLikes(
    @Param('postId') postId: number,
    @Req() req: any
  ) {
    const userId = req.user;
    return this.likesService.manejoLikes(userId.id, postId);
  }

  @Get(':postId')
  @ApiOperation({ summary: "get all posts likes" })
  async findAllLikes(
    @Param('postId') postId: number
  ) {
    return this.likesService.findAllLikes(postId);
  }

  @Get('like/:likeId')
  @ApiOperation({ summary: "get one like" })
  async findOneLike(
    @Param('likeId') likeId: number
  ) {
    return this.likesService.findOneLike(likeId);
  }

  @Get('user/:userId')
  async findLikesByUser(
    @Param('userId') userId: number,
    @Req() req: any
  ) {
    const requesterId = req.user.id;
    return this.likesService.findLikesByUser(userId, requesterId)
  }
}
