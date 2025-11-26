import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EstadoEnum, TypeEnumReport } from '../dtos/update-reporte.dto';

@Schema({ timestamps: true, collection: 'reportes' })
export class Reporte extends Document {
  @Prop({ enum: TypeEnumReport, required: true })
  type: string;

  @Prop({ required: true })
  motivo: string;

  @Prop()
  descripcion?: string;

  /*   @Prop({ enum: EstadoEnum, default: EstadoEnum.PENDIENTE })
  estado: string; */

  @Prop({ type: Types.ObjectId, required: true })
  reporterId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  reportedId: Types.ObjectId;
}

export const ReporteSchema = SchemaFactory.createForClass(Reporte);
