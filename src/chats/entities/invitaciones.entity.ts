import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Grupos } from './chats.entity';
import { Status } from 'src/config/enums/status.enum';
import { userSchema } from 'src/users/userSchema/users.schema';

@Entity('invitacionesGrupos')
export class InvitacionesGrupos {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => userSchema, (user) => user.grupos, { onDelete: 'CASCADE' })
    user: userSchema;

    @ManyToOne(() => Grupos, (grupo) => grupo.invitaciones, { onDelete: 'CASCADE', eager: true })
    grupo: Grupos;

    @Column({
        type: 'enum',
        enum: Status,
        default: Status.Pendiente,
    })
    status: Status;
}
