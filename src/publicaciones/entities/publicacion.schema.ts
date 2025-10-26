import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Comentario } from '../models/comentario.model';

@Schema({ timestamps: true, collection: 'publicaciones' })
export class Publicacion extends Document {
  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ default: null, trim: true })
  imagen: string;

  @Prop({ default: false })
  esAnonimo: boolean;

  @Prop({ type: [Comentario], default: [] })
  comentarios: Comentario[];

  @Prop({ default: 0 })
  cantComentarios?: number;

  @Prop({ type: [Types.ObjectId], ref: 'Like', default: [] })
  likes: Types.ObjectId[];

  @Prop({ default: 0 })
  cantLikes?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
