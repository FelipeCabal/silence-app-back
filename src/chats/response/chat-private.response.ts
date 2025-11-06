import { ApiProperty } from '@nestjs/swagger';

export class ChatPrivadoResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amistadSummary: any;

  @ApiProperty()
  lastMessage?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromModel(model: any): ChatPrivadoResponseDto {
    const dto = new ChatPrivadoResponseDto();
    dto.id = model._id.toString();
    dto.amistadSummary = model.amistadSummary;
    dto.lastMessage = model.lastMessage;
    dto.createdAt = model.createdAt;
    dto.updatedAt = model.updatedAt;
    return dto;
  }
}
