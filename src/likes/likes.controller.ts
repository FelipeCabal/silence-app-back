import { Body, Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { LikesService } from "./likes.service";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { get, request } from "http";


@Controller("likes")
@ApiTags('Likes')
export class LikesController {
    constructor(private readonly likesService: LikesService) { }

    @UseGuards(AuthGuard)
    @Get()
    @ApiOperation({ summary: 'obtener todos mis likes' })
    async getUserLikes(
        @Request() req: any
    ) {
        return this.likesService.getUserLikes(req.user.id);
    }

    @UseGuards(AuthGuard)
    @Post('like/:postId')
    @ApiParam({ name: 'postId', description: 'ID of the post to like' })
    @ApiOperation({ summary: 'Like a post' })
    async likePost(
        @Param('postId') postId: string,
        @Request() req: any
    ) {
        return this.likesService.likePost(postId, req.user.id);
    }

    @UseGuards(AuthGuard)
    @Post('unlike/:postId')
    @ApiParam({ name: 'postId', description: 'ID of the post to unlike' })
    @ApiOperation({ summary: 'Unlike a post' })
    async unlikePost(
        @Param('postId') postId: string,
        @Request() req: any
    ) {
        return this.likesService.unlikePost(postId, req.user.id);
    }
}