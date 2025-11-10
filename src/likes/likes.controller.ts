import { Body, Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LikesService } from "./likes.service";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { get, request } from "http";
import { PublicacionResponseDto } from "src/publicaciones/dto/responses/publicacion-response.dto";


@Controller("likes")
@ApiTags('Likes')
export class LikesController {
    constructor(private readonly likesService: LikesService) { }

    @UseGuards(AuthGuard)
    @Get()
    @ApiOperation({ summary: 'Get all my likes' })
    @ApiResponse({ status: 200, type: [PublicacionResponseDto] })
    @ApiResponse({ status: 404, description: 'No likes found' })
    async getUserLikes(
        @Request() req: any
    ) {
        return this.likesService.getUserLikes(req.user.id);
    }

    @UseGuards(AuthGuard)
    @Post('like/:postId')
    @ApiParam({ name: 'postId', description: 'ID of the post to like' })
    @ApiOperation({ summary: 'Like a post' })
    @ApiResponse({ status: 200, description: 'Post liked successfully' })
    @ApiResponse({ status: 404, description: 'Post not found' })
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
    @ApiResponse({ status: 200, description: 'Post unliked successfully' })
    @ApiResponse({ status: 404, description: 'Post not found' })
    async unlikePost(
        @Param('postId') postId: string,
        @Request() req: any
    ) {
        return this.likesService.unlikePost(postId, req.user.id);
    }
}