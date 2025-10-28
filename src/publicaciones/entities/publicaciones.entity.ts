import { Like } from "src/likes/like.entity";
import { userSchema } from "src/users/entities/users.schema";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('publicaciones')
export class Publicaciones {
    @PrimaryGeneratedColumn()
    id: string

    @Column()
    description: string

    @Column({ nullable: true })
    imagen: string

    @Column({ default: false })
    esAnonimo: boolean

    @ManyToOne(() => userSchema, (user) => user.publicaciones)
    user: userSchema

    @OneToMany(() => Like, (likes) => likes.publicaciones)
    likes: Like[]
}
