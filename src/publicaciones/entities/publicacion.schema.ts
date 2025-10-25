import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Comentario } from '../comentarios/entities/comentarios.schema';
import { ComentarioResponseDto } from '../comentarios/dto/responses/comentario-response.dto';

@Schema({ timestamps: true, collection: 'publicaciones' })
export class Publicacion extends Document {
  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ default: null, trim: true })
  imagen: string;

  @Prop({ default: false })
  esAnonimo: boolean;

  @Prop({ type: [ComentarioResponseDto], default: [] })
  comentarios: ComentarioResponseDto[];

  @Prop({ default: 0 })
  cantLikes?: number;

  @Prop({ default: 0 })
  cantComentarios?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
