import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Comentario } from '../models/comentario.model';
import { User } from 'src/users/entities/user.model';

@Schema({ timestamps: true, collection: 'publicaciones' })
export class Publicacion extends Document {
  @Prop({ required: true, trim: true })
  description: string;

  @Prop({
    type: [String],
    default: null,
    validate: {
      validator: (arr: string[]) => !arr || arr.length <= 5,
      message: 'No puede subir más de 5 imágenes'
    },
    trim: true
  })
  imagen: string[];

  @Prop({ default: false })
  esAnonimo: boolean;

  @Prop({ type: User, default: null })
  owner: User

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
