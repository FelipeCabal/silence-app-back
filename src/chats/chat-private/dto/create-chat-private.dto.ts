import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateChatPrivadoDto {
  @IsNotEmpty()
  @IsMongoId()
  amistad: string;
}
