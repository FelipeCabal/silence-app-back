import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
class UsuarioComentario {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  nombre: string;

  @Prop({ type: String, default: null })
  imagen?: string;

  @Prop({ type: String, required: true })
  userId: string;
}

export class Comentario {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: UsuarioComentario, required: true })
  usuario: UsuarioComentario;

  @Prop({ required: true, trim: true })
  comentario: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}
