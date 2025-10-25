import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'comentarios' })
export class Comentario extends Document {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Publicacion',
  })
  publicacion: Types.ObjectId;

  @Prop({
    required: true,
    type: String,
    trim: true,
  })
  comentario: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
