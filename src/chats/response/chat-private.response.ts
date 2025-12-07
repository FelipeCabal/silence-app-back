import { ApiProperty } from '@nestjs/swagger';

export class ChatPrivadoResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amistad: any;

  @ApiProperty()
  lastMessage?: string;

  @ApiProperty({
    description: 'Nombre del otro usuario en el chat',
    example: 'Juan Pérez'
  })
  nombre?: string;

  @ApiProperty({
    description: 'Imagen del otro usuario en el chat',
    example: 'https://example.com/image.jpg'
  })
  imagen?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromModel(model: any, otherUser?: any): ChatPrivadoResponseDto {
    const dto = new ChatPrivadoResponseDto();
    dto.id = model._id.toString();
    dto.amistad = model.amistad;
    dto.lastMessage = model.lastMessage;
    dto.nombre = otherUser?.nombre || null;
    dto.imagen = otherUser?.imagen || null;
    dto.createdAt = model.createdAt;
    dto.updatedAt = model.updatedAt;
    return dto;
  }
}
