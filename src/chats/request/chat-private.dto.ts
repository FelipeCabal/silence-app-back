import { IsMongoId, IsString, IsOptional } from 'class-validator';

export class CreateChatPrivadoDto {
  @IsMongoId()
  amistad: string; 
  @IsOptional()
  @IsString()
  lastMessage?: string;
}
