import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PublicacionModel } from 'src/publicaciones/models/publciacion-summary.model';

@Schema({ collection: 'users', timestamps: true })
export class UserSchema extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop()
  descripcion: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  fechaNto: Date;

  @Prop()
  sexo: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  pais: string;

  @Prop({ default: null })
  imagen?: string;

  @Prop({ default: true })
  ShowLikes: boolean;

  @Prop({
    type: [
      {
        _id: String,
        descripcion: String,
        imagen: String,
      },
    ],
    default: [],
  })
  publicaciones: Array<Record<string, any>>;

  @Prop({
    type: [
      {
        _id: String,
        nombre: String,
      },
    ],
    default: [],
  })
  comunidades: Array<Record<string, any>>;

  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, ref: 'Reporte' },
        motivo: { type: String },
        estado: { type: String },
      },
    ],
    default: [],
  })
  reportes: Array<{
    _id: Types.ObjectId;
    motivo: string;
    estado: string;
  }>;

  @Prop({
    type: [
      {
        _id: String,
        nombre: String,
      },
    ],
    default: [],
  })
  grupos: Array<Record<string, any>>;

  @Prop({
    type: [
      {
        _id: false,
        enviadas: [{ _id: String, to: String, estado: String, fecha: Date }],
        recibidas: [{ _id: String, from: String, estado: String, fecha: Date }],
      },
    ],
    default: [{ enviadas: [], recibidas: [] }],
  })
  solicitudesAmistad: Record<string, any>;

  @Prop({
    type: [PublicacionModel],
    default: [],
  })
  likes: PublicacionModel[];
}

export const userModelSchema = SchemaFactory.createForClass(UserSchema);
