import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({
    timestamps: true
})
export class comentariosSchema {

    @Prop({ required: true })
    usuarioId: String

    @Prop({
        trim: true
    })
    comentario: string

    @Prop({ required: true })
    postId: number
}

export const comentarioModelSchema = SchemaFactory.createForClass(comentariosSchema)