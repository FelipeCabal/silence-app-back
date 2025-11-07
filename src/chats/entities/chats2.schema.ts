import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'chats_privados' })
export class ChatPrivado extends Document {
  @Prop({ type: Types.ObjectId, ref: 'SolicitudAmistad', required: true })
  amistad: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createAt: Date;
}

export const ChatPrivadoSchema = SchemaFactory.createForClass(ChatPrivado);

@Schema({ timestamps: true, collection: 'grupos' })
export class Grupos extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop()
  descripcion?: string;

  @Prop()
  imagen?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  miembros: Types.ObjectId[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'InvitacionesGrupos' }],
    default: [],
  })
  invitaciones: Types.ObjectId[];
}

export const GruposSchema = SchemaFactory.createForClass(Grupos);

@Schema({ timestamps: true, collection: 'comunidades' })
export class Comunidades extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop()
  descripcion?: string;

  @Prop()
  imagen?: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'MiembrosComunidades' }],
    default: [],
  })
  miembros: Types.ObjectId[];
}

export const ComunidadesSchema = SchemaFactory.createForClass(Comunidades);
