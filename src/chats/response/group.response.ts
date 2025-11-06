import { Grupos } from "../entitesNosql/groups.schema";
import { MembersSummary } from "../models/member.model";

export class GrupoResponseDto {
  id: string;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  membersSummary: MembersSummary;

  static fromModel(model: Grupos): GrupoResponseDto {
    return {
      id: model._id.toString(),
      nombre: model.nombre,
      descripcion: model.descripcion,
      imagen: model.imagen,
      membersSummary: model.membersSummary,
    };
  }
}
