import {
  Body,
  Controller,
  Delete,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ComentariosService } from './comentarios.service';
import { CreateComentarioDto } from './dto/requests/create-comentario.dto';
import { UpdateComentarioDto } from './dto/requests/update-comentario.dto';

@Controller('posts/comments')
@ApiTags('Comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Post(':postId')
  @ApiParam({ name: 'postId', description: 'ID of the post to comment on' })
  @ApiOperation({ summary: 'Create a new comment on a post' })
  async createComment(
    @Param('postId') postId: string,
    @Body() body: CreateComentarioDto,
  ) {
    const comentario = await this.comentariosService.createComentario(
      postId,
      body,
    );

    if (!comentario)
      throw new NotFoundException('Post not found with id:' + postId);

    return comentario;
  }

  @Patch(':commentId')
  @ApiParam({ name: 'commentId', description: 'ID of the comment to update' })
  @ApiOperation({ summary: 'Update an existing comment' })
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() body: UpdateComentarioDto,
  ) {
    const comentario = await this.comentariosService.updateComentario(
      commentId,
      body,
    );

    if (!comentario)
      throw new NotFoundException('Comment not found with id:' + commentId);

    return comentario;
  }

  @Delete(':commentId')
  @ApiParam({ name: 'commentId', description: 'ID of the comment to delete' })
  @ApiOperation({ summary: 'Delete a comment' })
  async deleteComment(@Param('commentId') commentId: string) {
    const comentario =
      await this.comentariosService.deleteComentario(commentId);

    if (!comentario)
      throw new NotFoundException('Comment not found with id: ' + commentId);

    return comentario;
  }
}
