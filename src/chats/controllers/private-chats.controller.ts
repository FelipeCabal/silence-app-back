import { Controller, Delete, Get, Param, Query, Request, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrivateChatsService } from "../services/private-chats.service";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { ComunityAndGroupQueries } from "../dto/queries/comunities-queries.dto";

@Controller('private')
@ApiTags('private-chats')
@UseGuards(AuthGuard)
export class PrivateChatsController {
    constructor(private readonly privateChatsService: PrivateChatsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all users private chats' })
    findAllPrivateChats(
        @Request() req: any,
        @Query() chatQueries: ComunityAndGroupQueries,
    ) {
        const userId = req.user._id
        return this.privateChatsService.findAllUserChats(userId, chatQueries);
    }

    @Get(':id')
    @ApiOperation({ summary: "Get a private chat" })
    findOne(@Param('id') id: string) {
        return this.privateChatsService.findOne(+id);
    }

}