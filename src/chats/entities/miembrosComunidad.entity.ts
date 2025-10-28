import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Role } from 'src/config/enums/roles.enum';
import { Comunidades } from './chats.entity';
import { userSchema } from 'src/users/entities/users.schema';

@Entity('miembros_comunidades')
export class MiembrosComunidades {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Comunidades, (comunidad) => comunidad.miembros)
    comunidad: Comunidades;

    @ManyToOne(() => userSchema, (user) => user.comunidades)
    usuario: userSchema;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.Member,
    })
    rol: Role;
}
