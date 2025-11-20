// src/reportes/models/reporte-summary.model.ts
import { Prop } from '@nestjs/mongoose';

export class ReporteSummary {
  @Prop({ required: true })
  _id: string;

  @Prop({ enum: ['usuario', 'comunidad', 'publicacion'], required: true })
  type: string;

  @Prop({ required: true })
  motivo: string;

  @Prop({ required: true })
  estado: string;
}
