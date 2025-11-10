import { Role } from 'src/config/enums/roles.enum';
import { User } from '../../users/entities/user.model';
import { MiembrosComunidades } from '../schemas/miembros-community.schema';

export class MiembroComunidadResponseDto {
  id: string;
  user: User;
  rol: Role;

  static fromModel(model: MiembrosComunidades): MiembroComunidadResponseDto {
    return {
      id: model._id.toString(),
      user: model.user,
      rol: model.rol,
    };
  }
}
