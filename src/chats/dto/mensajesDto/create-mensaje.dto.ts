import { IsString, IsNumber, IsNotEmpty, isNumber } from 'class-validator';

export class CreateMessageDto {

    @IsString()
    @IsNotEmpty()
    message: string;    

    @IsNumber()
    @IsNotEmpty()
    chatId: number;     // ID del chat (privado, grupal, comunidad)

    @IsString()
    @IsNotEmpty()
    chatType: string;   // Tipo de chat: 'private', 'group', 'community'
}
