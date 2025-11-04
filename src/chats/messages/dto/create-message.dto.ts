import { IsMongoId, IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsMongoId()
  @IsNotEmpty()
  usuarioId: string;

  @IsMongoId()
  @IsNotEmpty()
  chatId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsIn(['private', 'group', 'community'])
  chatType: string;

  @IsOptional()
  attachments?: any[];
}
