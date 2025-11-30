import {
  Body,
  Controller,
  Delete,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ComentariosService } from '../services/comentarios.service';
import { CreateComentarioDto } from '../dto/requests/comentarios/create-comentario.dto';
import { UpdateComentarioDto } from '../dto/requests/comentarios/update-comentario.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';

@Controller('posts/comments')
@ApiTags('Comentarios')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) { }

  @Post(':postId')
  @ApiParam({ name: 'postId', description: 'ID of the post to comment on' })
  @ApiOperation({ summary: 'Create a new comment on a post' })
  async createComment(
    @Param('postId') postId: string,
    @Body() body: CreateComentarioDto,
    @Request() req: any,
  ) {
    return await this.comentariosService.createComentario(postId, req.user._id, body);
  }

  @Patch(':commentId')
  @ApiParam({ name: 'commentId', description: 'ID of the comment to update' })
  @ApiOperation({ summary: 'Update an existing comment' })
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() body: UpdateComentarioDto,
  ) {
    return this.comentariosService.updateComentario(commentId, body);
  }

  @Delete(':commentId')
  @ApiParam({ name: 'commentId', description: 'ID of the comment to delete' })
  @ApiOperation({ summary: 'Delete a comment' })
  async deleteComment(@Param('commentId') commentId: string) {
    return this.comentariosService.deleteComentario(commentId);
  }
}
