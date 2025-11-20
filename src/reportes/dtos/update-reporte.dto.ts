export enum EstadoEnum {
  PENDIENTE = 'PENDIENTE',
  REVISADO = 'REVISADO',
  RESUELTO = 'RESUELTO',
}

export enum TypeEnumReport {
  COMUNIDAD = 'COMUNIDAD',
  USUARIO = 'USUARIO',
}

export class UpdateEstadoReporteDto {
  estado: EstadoEnum;
}
