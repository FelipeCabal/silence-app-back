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
    @Param('postId') postId: string,
    @Req() req: any
  ) {
    const userId = req.user;
    return this.likesService.likePost(postId, userId);
  }

  @Get('user/:userId')
  async findLikesByUser(
    @Param('userId') userId: string,
    @Req() req: any
  ) {
    const requesterId = req.user.id;
    return this.likesService.findLikesByUser(userId)
  }
}
