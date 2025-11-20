import { ApiProperty } from '@nestjs/swagger';

export class ChatPrivadoResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amistad: any;

  @ApiProperty()
  lastMessage?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromModel(model: any): ChatPrivadoResponseDto {
    const dto = new ChatPrivadoResponseDto();
    dto.id = model._id.toString();
    dto.amistad = model.amistad;
    dto.lastMessage = model.lastMessage;
    dto.createdAt = model.createdAt;
    dto.updatedAt = model.updatedAt;
    return dto;
  }
}
