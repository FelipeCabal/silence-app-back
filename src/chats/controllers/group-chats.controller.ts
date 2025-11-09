import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { GroupChatsService } from "../services/gruop-chats.service";
import { createGrupoDto } from "../dto/GruposDto/create-grupos.dto";
import { Grupos } from "../entities/chats.entity";
import { updateGruposDto } from "../dto/GruposDto/update-grupos.dto";
import { ComunityAndGroupQueries } from "../dto/queries/comunities-queries.dto";

@Controller('group')
@ApiTags('group-chats')
@UseGuards(AuthGuard)
export class GroupChatsController {
    constructor(private readonly groupChatsService: GroupChatsService) { }

    @Post()
    @ApiOperation({ summary: 'Create Group' })
    create(
        @Body() createChatDto: createGrupoDto,
        @Request() req: any
    ) {
        const userId = req.user.id
        return this.groupChatsService.create(createChatDto, userId)
    }

    @Get()
    @ApiOperation({ summary: 'Get all users group' })
    findAllGroupsByUser(
        @Request() req: any,
        @Query() queries: ComunityAndGroupQueries
    ) {
        const userId = req.user.id
        return this.groupChatsService.findAllGroups(userId, queries);
    }

    @Get(':id')
    @ApiOperation({ summary: "Get a group chat" })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.groupChatsService.findGroupById(id);
    }

    /* @Patch(':id')
     @ApiOperation({ summary: "Update a group chat" })
     async updateGroup(
         @Param('id', ParseIntPipe) id: number,
         @Body() updateChatDto: updateGruposDto,
     ): Promise<Grupos> {
         return await this.groupChatsService.update(id, updateChatDto);
     }
 
     @Delete(':groupId/usuarios/:userId')
     @ApiOperation({ summary: "Delete an user from group chat" })
     async removeUserFromGroup(
         @Param('groupId', ParseIntPipe) groupId: number,
         @Param('userId') userId: String,
     ): Promise<Grupos> {
         return await this.groupChatsService.removeUserFromGroup(groupId, userId);
     }
 
 
     @Delete(':id')
     @ApiOperation({ summary: "Delete a group chat" })
     async removeGroup(@Param('id', ParseIntPipe) id: number): Promise<void> {
         await this.groupChatsService.remove(id);
     }*/

}