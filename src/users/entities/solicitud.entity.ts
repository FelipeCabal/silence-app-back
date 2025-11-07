import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Status } from 'src/config/enums/status.enum';
/* import { ChatPrivado } from "src/chats/entities/chats.entity"; */
import { User } from './user.entity';

@Entity('solicitudAmistad')
export class SolicitudAmistad {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.enviaSolicitudAmistad)
  userEnvia: User;

  @ManyToOne(() => User, (user) => user.recibeSolicitudAmistad)
  userRecibe: User;

  @Column({ default: 'P' })
  status: Status;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  /*     @OneToOne(() => ChatPrivado, (chatPrivado) => chatPrivado.amistad, { cascade: true, onDelete: 'CASCADE' })
    chatPrivado: ChatPrivado */
}
