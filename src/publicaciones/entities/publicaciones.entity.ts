import { Like } from "src/likes/like.entity";
import { User } from "src/users/entities/user.entity";
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

    @ManyToOne(() => User, (user) => user.publicaciones)
    user: User

    @OneToMany(() => Like, (likes) => likes.publicaciones)
    likes: Like[]
}
