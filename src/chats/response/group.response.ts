import { Grupos } from '../schemas/groups.schema';
import { Members } from '../models/member.model';
import { ApiProperty } from '@nestjs/swagger';

export class GrupoResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  nombre: string;
  @ApiProperty()
  descripcion?: string;
  @ApiProperty()
  imagen?: string;
  @ApiProperty()
  members: Members[];

  static fromModel(model: Grupos): GrupoResponseDto {
    return {
      id: model._id.toString(),
      nombre: model.nombre,
      descripcion: model.descripcion,
      imagen: model.imagen,
      members: model.members,
    };
  }
}
