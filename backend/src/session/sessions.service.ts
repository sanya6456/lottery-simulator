import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Session, SessionStatus } from '../lib/entities/session.entity';
import { WinningDraw } from '../lib/entities/winning-draw.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import {
  SESSION_REPOSITORY,
  WINNING_DRAW_REPOSITORY,
} from './session.repository';

@Injectable()
export class SessionsService {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessions: Repository<Session>,
    @Inject(WINNING_DRAW_REPOSITORY)
    private readonly winningDraws: Repository<WinningDraw>,
  ) {}

  create(dto: CreateSessionDto): Promise<Session> {
    const session = this.sessions.create({
      useRandomNumbers: dto.useRandomNumbers,
      playerNumbers: dto.useRandomNumbers ? null : dto.playerNumbers,
      speedMs: dto.speedMs ?? 1000,
    });

    return this.sessions.save(session);
  }

  async findOneOrFail(id: string): Promise<Session> {
    const session = await this.sessions.findOneBy({ id });
    if (!session) throw new NotFoundException(`Session ${id} not found`);
    return session;
  }

  async updateSpeed(id: string, speedMs: number): Promise<Session> {
    const session = await this.findOneOrFail(id);
    session.speedMs = speedMs;
    return this.sessions.save(session);
  }

  async end(id: string, status: SessionStatus): Promise<Session> {
    const session = await this.findOneOrFail(id);
    session.status = status;
    session.endedAt = new Date();
    return this.sessions.save(session);
  }

  async incrementDraws(id: string): Promise<void> {
    await this.sessions.increment({ id }, 'totalDraws', 1);
  }

  getWinningDraws(sessionId: string): Promise<WinningDraw[]> {
    return this.winningDraws.findBy({ sessionId });
  }

  saveWinningDraw(data: {
    sessionId: string;
    drawNumber: number;
    playerNumbers: number[];
    drawnNumbers: number[];
    hits: number;
  }): Promise<WinningDraw> {
    const draw = this.winningDraws.create(data);
    return this.winningDraws.save(draw);
  }
}
