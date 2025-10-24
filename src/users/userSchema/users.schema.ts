import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ collection: 'users', timestamps: true })
export class userSchema extends Document {

    @Prop({ required: true })
    nombre: String;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop()
    fechaNto: Date;

    @Prop()
    sexo: String;

    @Prop({ required: true })
    password: string;

    @Prop()
    pais: string;

    @Prop()
    imagen?: string;

    @Prop({ default: true })
    ShowLikes: boolean;

    @Prop({
        type: [{
            _id: String,
            descripcion: String,
            imagen: String
        },
        ],
        default: [],
    })
    publicaciones: Array<Record<string, any>>;

    @Prop({
        type: [{
            _id: String,
            nombre: String
        },
        ],
        default: [],
    })
    comunidades: Array<Record<string, any>>;

    @Prop({
        type: [{
            _id: String,
            nombre: String,
        },
        ],
        default: [],
    })
    grupos: Array<Record<string, any>>;


    @Prop({
        type: {
            enviadas: [{ to: String, estado: String, fecha: Date }],
            recibidas: [{ from: String, estado: String, fecha: Date }],
        },
        default: { enviadas: [], recibidas: [] },
    })
    solicitudesAmistad: Record<string, any>;

    @Prop({
        type: [{ postId: String, fecha: Date }],
        default: [],
    })
    likes: Array<Record<string, any>>;
}

export const userModelSchema = SchemaFactory.createForClass(userSchema);