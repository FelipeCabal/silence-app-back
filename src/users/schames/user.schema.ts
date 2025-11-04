import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'users' })
export class User extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: Date })
  fechaNto: Date;

  @Prop({ required: true })
  sexo: string;

  @Prop({ required: true, unique: true })
  password: string; // Se excluye en DTO, no en el schema

  @Prop({ required: true })
  pais: string;

  @Prop()
  imagen?: string;

  @Prop({ default: true })
  showLikes: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Publicaciones' }] })
  publicaciones: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'MiembrosComunidades' }] })
  comunidades: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'SolicitudAmistad' }] })
  enviaSolicitudAmistad: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'SolicitudAmistad' }] })
  recibeSolicitudAmistad: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Like' }] })
  likes: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Grupos' }] })
  grupos: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
