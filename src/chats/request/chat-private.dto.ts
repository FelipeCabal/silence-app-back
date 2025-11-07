import { IsMongoId, IsString, IsOptional } from 'class-validator';

export class CreateChatPrivadoDto {
  @IsMongoId()
  amistad: string; // ID de la solicitud de amistad

  @IsOptional()
  @IsString()
  lastMessage?: string;
}
