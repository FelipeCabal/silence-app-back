import { ApiProperty } from '@nestjs/swagger';
import { Status } from 'src/config/enums/status.enum';

export class InvitacionGrupoResponseDto {
  @ApiProperty({
    description: 'ID de la invitación',
    example: '64b7f9a2e1d3f2a5b6c7d8ea',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario invitado',
    example: '64b7f9a2e1d3f2a5b6c7d8ec',
  })
  userId: string;

  @ApiProperty({
    description: 'Nombre del usuario invitado',
    example: 'Carlos Pérez',
  })
  userName: string;

  @ApiProperty({
    description: 'Avatar del usuario invitado',
    example: 'https://example.com/avatar.jpg',
  })
  userAvatar: string;

  @ApiProperty({
    description: 'ID del grupo',
    example: '64b7f9a2e1d3f2a5b6c7d8ed',
  })
  grupoId: string;

  @ApiProperty({
    description: 'Nombre del grupo',
    example: 'Grupo de Estudio',
  })
  grupoNombre: string;

  @ApiProperty({
    description: 'Imagen del grupo',
    example: 'https://example.com/grupo.jpg',
  })
  grupoImagen: string;

  @ApiProperty({
    description: 'Estado de la invitación',
    example: Status.Pendiente,
  })
  status: Status;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2023-08-30T12:34:56Z',
  })
  createdAt: Date;

  public static fromModel(model: any): InvitacionGrupoResponseDto {
    const dto = new InvitacionGrupoResponseDto();
    dto.id = model._id?.toString();
    dto.userId = model.userId?.toString();
    dto.userName = model.userName;
    dto.userAvatar = model.userAvatar;
    dto.grupoId = model.grupoId?.toString();
    dto.grupoNombre = model.grupoNombre;
    dto.grupoImagen = model.grupoImagen;
    dto.status = model.status;
    dto.createdAt = model.createdAt;
    return dto;
  }
}
