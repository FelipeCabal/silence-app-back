import { Exclude } from "class-transformer";
import { Comunidades, Grupos } from "src/chats/entities/chats.entity";
import { InvitacionesGrupos } from "src/chats/entities/invitaciones.entity";
import { Publicaciones } from "src/publicaciones/entities/publicaciones.entity";
import { Column, Entity, IsNull, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { SolicitudAmistad } from "./solicitud.entity";
import { Like } from "src/likes/like.entity";
import { MiembrosComunidades } from "src/chats/entities/miembrosComunidad.entity";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nombre: string

    @Column()
    email: string

    @Column({ type: 'date' })
    fechaNto: Date

    @Column()
    sexo: string

    @Exclude()
    @Column({ unique: true })
    password: string

    @Column()
    pais: string

    @Column({ nullable: true })
    imagen: string


    @Column({ default: true })
    showLikes: boolean


    @OneToMany(() => Publicaciones, (publicaciones) => publicaciones.user)
    publicaciones: Publicaciones[]

    @OneToMany(() => MiembrosComunidades, (miembro) => miembro.usuario)
    comunidades: MiembrosComunidades[];

    @OneToMany(() => SolicitudAmistad, solicitudAmistad => solicitudAmistad.userEnvia)
    enviaSolicitudAmistad: SolicitudAmistad

    @OneToMany(() => SolicitudAmistad, solicitudAmistad => solicitudAmistad.userRecibe)
    recibeSolicitudAmistad: SolicitudAmistad

    @OneToMany(() => Like, (likes) => likes.user)
    likes: Like[]

    @ManyToMany(() => Grupos, (grupo) => grupo.miembros)
    grupos: Grupos[];
}
