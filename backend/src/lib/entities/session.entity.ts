import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WinningDraw } from './winning-draw.entity';

export enum SessionStatus {
  RUNNING = 'running',
  JACKPOT = 'jackpot',
  EXPIRED = 'expired', // 500 years reached
}

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.RUNNING,
  })
  status: SessionStatus;

  @Column({ name: 'use_random_numbers', default: false })
  useRandomNumbers: boolean;

  @Column({ name: 'player_numbers', type: 'int', array: true, nullable: true })
  playerNumbers: number[] | null;

  @Column({ name: 'speed_ms', default: 1000 })
  speedMs: number;

  @Column({ name: 'total_draws', default: 0 })
  totalDraws: number;

  @OneToMany(() => WinningDraw, (draw) => draw.session)
  winningDraws: WinningDraw[];

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'ended_at', nullable: true, type: 'timestamptz' })
  endedAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
