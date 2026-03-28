import { Injectable, Logger } from '@nestjs/common';
import { randomInt } from 'crypto';
import { WsGateway } from '../lib/websocket/ws.gateway';
import { SessionStatus } from '../lib/entities/session.entity';
import { SessionsService } from '../session/sessions.service';
import { DrawResult, DrawStats, WinCounts } from './simulation.types';

const DRAWS_PER_YEAR = 52;
const MAX_YEARS = 500;
const MAX_DRAWS = DRAWS_PER_YEAR * MAX_YEARS; // 26 000
const TICKET_PRICE = 300;

@Injectable()
export class SimulationService {
  private readonly logger = new Logger(SimulationService.name);

  /** sessionId → interval handle */
  private readonly loops = new Map<string, NodeJS.Timeout>();

  /** sessionId → running win counters (kept in memory for perf) */
  private readonly winCounts = new Map<string, WinCounts>();

  constructor(
    private readonly sessionsService: SessionsService,
    private readonly wsGateway: WsGateway,
  ) {}

  async start(sessionId: string): Promise<void> {
    if (this.loops.has(sessionId)) return;

    const session = await this.sessionsService.findOneOrFail(sessionId);
    this.winCounts.set(sessionId, { two: 0, three: 0, four: 0, five: 0 });

    const tick = async () => {
      try {
        await this.runDraw(sessionId);
      } catch (err) {
        this.logger.error(`Draw error for session ${sessionId}`, err);
        this.stop(sessionId);
      }
    };

    const handle = setInterval(() => void tick(), session.speedMs);
    this.loops.set(sessionId, handle);
    this.logger.log(`Simulation started for session ${sessionId}`);
  }

  stop(sessionId: string): void {
    const handle = this.loops.get(sessionId);
    if (handle) {
      clearInterval(handle);
      this.loops.delete(sessionId);
      this.winCounts.delete(sessionId);
      this.logger.log(`Simulation stopped for session ${sessionId}`);
    }
  }

  updateSpeed(sessionId: string, speedMs: number): void {
    const handle = this.loops.get(sessionId);
    if (!handle) return;

    clearInterval(handle);
    const tick = async () => {
      try {
        await this.runDraw(sessionId);
      } catch {
        this.stop(sessionId);
      }
    };
    const newHandle = setInterval(() => void tick(), speedMs);
    this.loops.set(sessionId, newHandle);
  }

  private async runDraw(sessionId: string): Promise<void> {
    const session = await this.sessionsService.findOneOrFail(sessionId);
    const drawNumber = session.totalDraws + 1;

    const playerNumbers = session.useRandomNumbers
      ? drawUniqueNumbers()
      : (session.playerNumbers as number[]);

    const drawnNumbers = drawUniqueNumbers();
    const hits = countHits(playerNumbers, drawnNumbers);

    await this.sessionsService.incrementDraws(sessionId);

    if (hits >= 2) {
      await this.sessionsService.saveWinningDraw({
        sessionId,
        drawNumber,
        playerNumbers,
        drawnNumbers,
        hits,
      });

      const wins = this.winCounts.get(sessionId)!;
      incrementWin(wins, hits);
    }

    const stats: DrawStats = buildStats(
      drawNumber,
      this.winCounts.get(sessionId)!,
    );
    const result: DrawResult = {
      sessionId,
      drawNumber,
      playerNumbers,
      drawnNumbers,
      hits,
      stats,
    };

    this.wsGateway.server.to(sessionId).emit('draw:result', result);

    const isJackpot = hits === 5;
    const isExpired = drawNumber >= MAX_DRAWS;

    if (isJackpot || isExpired) {
      this.stop(sessionId);
      const endStatus = isJackpot
        ? SessionStatus.JACKPOT
        : SessionStatus.EXPIRED;
      await this.sessionsService.end(sessionId, endStatus);
      this.wsGateway.server.to(sessionId).emit('session:ended', {
        reason: isJackpot ? 'jackpot' : 'expired',
        stats,
      });
    }
  }
}

function drawUniqueNumbers(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    numbers.add(randomInt(1, 91)); // [1, 90] inclusive
  }
  return [...numbers].sort((a, b) => a - b);
}

function countHits(playerNumbers: number[], drawnNumbers: number[]): number {
  const drawn = new Set(drawnNumbers);
  return playerNumbers.filter((n) => drawn.has(n)).length;
}

function incrementWin(wins: WinCounts, hits: number): void {
  if (hits === 2) wins.two++;
  else if (hits === 3) wins.three++;
  else if (hits === 4) wins.four++;
  else if (hits === 5) wins.five++;
}

function buildStats(totalDraws: number, wins: WinCounts): DrawStats {
  return {
    totalDraws,
    yearsElapsed: Math.floor(totalDraws / DRAWS_PER_YEAR),
    totalCost: totalDraws * TICKET_PRICE,
    wins,
  };
}
