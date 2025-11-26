import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Grupos } from '../schemas/groups.schema';

export class GrupoSummaryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  imagen?: string;

  @ApiProperty()
  lastMessage?: string;

  @ApiProperty()
  lastMessageDate?: Date;

  static fromModel(model: Grupos): GrupoSummaryResponseDto {
    return {
      id: model._id.toString(),
      nombre: model.nombre,
      imagen: model.imagen,
      lastMessage: model.lastMessage || null,
      lastMessageDate: model.lastMessageDate || null,
    };
  }
}
