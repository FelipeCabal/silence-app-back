import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Role } from 'src/config/enums/roles.enum';
import { Comunidades } from './chats.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('miembros_comunidades')
export class MiembrosComunidades {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Comunidades, (comunidad) => comunidad.miembros)
    comunidad: Comunidades;

    @ManyToOne(() => User, (user) => user.comunidades)
    usuario: User;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.Member,
    })
    rol: Role;
}
