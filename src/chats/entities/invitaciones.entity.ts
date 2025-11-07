import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
/* import { Grupos } from './chats.entity'; */
import { Status } from 'src/config/enums/status.enum';
import { User } from 'src/users/entities/user.entity';

@Entity('invitacionesGrupos')
export class InvitacionesGrupos {
  @PrimaryGeneratedColumn()
  id: number;
  /* 
    @ManyToOne(() => User, (user) => user.grupos, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Grupos, (grupo) => grupo.invitaciones, { onDelete: 'CASCADE', eager: true })
    grupo: Grupos;
 */
  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Pendiente,
  })
  status: Status;
}
