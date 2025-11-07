import { Comunidades } from "../schemas/community.schema";
import { MembersSummary } from "../models/member.model";

export class ComunidadResponseDto {
  id: string;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  miembrosSummary: MembersSummary[];

  static fromModel(model: Comunidades): ComunidadResponseDto {
    return {
      id: model._id.toString(),
      nombre: model.nombre,
      descripcion: model.descripcion,
      imagen: model.imagen,
      miembrosSummary: model.miembrosSummary || [],
    };
  }
}
