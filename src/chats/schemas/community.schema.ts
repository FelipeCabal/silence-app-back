import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Members} from '../models/member.model';

@Schema({ timestamps: true })
export class Comunidades extends Document {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop()
  descripcion?: string;

  @Prop()
  imagen?: string;

  @Prop({ type: [Members], default: [] })
  miembros: Members[];

    @Prop()
    lastMessage?: string;
      @Prop({ type: Date, default: () => new Date() })
  lastMessageDate: Date;
  
     @Prop({
      type: [
        {
          mensaje: { type: String, required: true },
          fecha: { type: Date, default: Date.now },
          remitente: { type: Types.ObjectId, ref: 'User', required: true },
  
        },
      ],
      default: [],
    })
    mensajes: {
      mensaje: string;
      fecha: Date;
      remitente: Types.ObjectId;
  
    }[];
}

export const ComunidadesSchema = SchemaFactory.createForClass(Comunidades);
