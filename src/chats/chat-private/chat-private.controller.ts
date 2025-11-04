import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreateChatPrivadoDto } from './dto/create-chat-private.dto';
import { ChatPrivateService } from './chat-private.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ComunityAndGroupQueries } from '../dto/queries/comunities-queries.dto';
import { ReponseData } from './response.interface';

@Controller('chat-privado')
@ApiTags('private-chats')
@UseGuards(AuthGuard)
export class chatPrivateController {
  constructor(private readonly chatPrivateService: ChatPrivateService) {}

  @Post()
  async create(@Body() dto: CreateChatPrivadoDto) {
    return this.chatPrivateService.create(dto);
  }

  @Get()
  async findAll(
    @Query() chatQueries: ComunityAndGroupQueries,
    @Param('userId') userId:string,
  ):Promise<ReponseData> {
    const data= await this.chatPrivateService.findAll(chatQueries,userId);
    return{
      err:false,
      msg:"chats traidos correctamente",
      datas:data
    }
  }

  @Get(':id')
  @ApiOperation({ summary: "Get a private chat" })
  async findById(@Param('id') id: string) {
    return this.chatPrivateService.findById(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.chatPrivateService.delete(id);
  }
}
