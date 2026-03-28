import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Session } from './session.entity';

@Entity('winning_draws')
export class WinningDraw {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id' })
  sessionId: string;

  @ManyToOne(() => Session, (session) => session.winningDraws, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ name: 'draw_number' })
  drawNumber: number;

  @Column({ name: 'player_numbers', type: 'int', array: true })
  playerNumbers: number[];

  @Column({ name: 'drawn_numbers', type: 'int', array: true })
  drawnNumbers: number[];

  /** Number of matching numbers: 2, 3, 4, or 5 */
  @Column({ type: 'smallint' })
  hits: number;

  @CreateDateColumn({ name: 'drawn_at' })
  drawnAt: Date;
}
