import { IsMongoId, IsEnum } from 'class-validator';
import { Role } from 'src/config/enums/roles.enum';

export class AddMiembroComunidadDto {
  @IsMongoId()
  usuarioId: string;

  @IsEnum(Role)
  rol: Role = Role.Member;
}
