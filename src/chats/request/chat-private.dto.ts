import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString, IsOptional } from 'class-validator';

export class CreateChatPrivadoDto {
  @IsMongoId()
  @ApiProperty()
  amistad: string; 
  @IsOptional()
  @IsString()
  @ApiProperty()
  lastMessage?: string;
}
