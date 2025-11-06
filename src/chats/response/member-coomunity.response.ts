import { Role } from 'src/config/enums/roles.enum';
import { UserSummary } from '../../users/entities/user.model';
import { MiembrosComunidades } from '../entitesNosql/miembros-community.schema';

export class MiembroComunidadResponseDto {
  id: string;
  usuario: UserSummary;
  rol: Role;

  static fromModel(model: MiembrosComunidades): MiembroComunidadResponseDto {
    return {
      id: model._id.toString(),
      usuario: model.usuarioSummary,
      rol: model.rol,
    };
  }
}
