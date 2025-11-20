import { Comunidades } from '../schemas/community.schema';
import { Members } from '../models/member.model';
import { ApiProperty } from '@nestjs/swagger';

export class ComunidadResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  nombre: string;
  @ApiProperty()
  descripcion?: string;
  @ApiProperty()
  imagen?: string;
  @ApiProperty()
  miembros: Members[];

  static fromModel(model: Comunidades): ComunidadResponseDto {
    return {
      id: model._id.toString(),
      nombre: model.nombre,
      descripcion: model.descripcion,
      imagen: model.imagen,
      miembros: model.miembros || [],
    };
  }
}
