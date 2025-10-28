import { Prop } from "@nestjs/mongoose";
import { Types } from "mongoose";

export class UserModel {

    @Prop({ type: Types.ObjectId, auto: true })
    _id: Types.ObjectId;

    @Prop({ required: true, trim: true })
    nombre: string;

    @Prop({ trim: true })
    descripcion: string;

    @Prop()
    imagen?: string
}