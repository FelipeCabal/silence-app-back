import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Status } from "src/config/enums/status.enum";
import { ChatPrivado } from "src/chats/entities/chats.entity";
import { userSchema } from "./users.schema";

@Entity('solicitudAmistad')
export class SolicitudAmistad {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => userSchema, user => user.enviaSolicitudAmistad)
    userEnvia: userSchema

    @ManyToOne(() => userSchema, user => user.recibeSolicitudAmistad)
    userRecibe: userSchema

    @Column({ default: 'P' })
    status: Status

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date

    @OneToOne(() => ChatPrivado, (chatPrivado) => chatPrivado.amistad, { cascade: true, onDelete: 'CASCADE' })
    chatPrivado: ChatPrivado
}