import { IsString, IsNumber, IsNotEmpty, isNumber } from 'class-validator';

export class CreateMessageDto {

    @IsString()
    @IsNotEmpty()
    message: string;    


}
