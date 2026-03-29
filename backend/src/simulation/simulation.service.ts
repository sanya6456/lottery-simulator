import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import Redis from 'ioredis';
import { WsGateway } from '../lib/websocket/ws.gateway';
import { SessionStatus } from '../lib/entities/session.entity';
import { SessionsService } from '../session/sessions.service';
import { REDIS_CLIENT, REDIS_SUBSCRIBER } from '../lib/modules/redis.module';
import { DrawResult, DrawStats, WinCounts } from './simulation.types';

const DRAWS_PER_YEAR = 52;
const MAX_YEARS = 500;
const MAX_DRAWS = DRAWS_PER_YEAR * MAX_YEARS; // 26 000
const TICKET_PRICE = 300;
const CONTROL_CHANNEL = 'session:control';

type ControlMessage =
  | { type: 'stop'; sessionId: string }
  | { type: 'speed'; sessionId: string; speedMs: number };

@Injectable()
export class SimulationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SimulationService.name);

  /** sessionId → interval handle (local to this instance) */
  private readonly loops = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly sessionsService: SessionsService,
    private readonly wsGateway: WsGateway,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(REDIS_SUBSCRIBER) private readonly subscriber: Redis,
  ) {}

  onModuleInit() {
    void this.subscriber.subscribe(CONTROL_CHANNEL);
    this.subscriber.on('message', (_channel: string, raw: string) => {
      const msg = JSON.parse(raw) as ControlMessage;
      if (!this.loops.has(msg.sessionId)) return;
      if (msg.type === 'stop') {
        this.stopLocal(msg.sessionId);
      } else if (msg.type === 'speed') {
        this.restartLoop(msg.sessionId, msg.speedMs);
      }
    });
  }

  onModuleDestroy() {
    for (const sessionId of this.loops.keys()) {
      this.stopLocal(sessionId);
    }
  }

  async start(sessionId: string): Promise<void> {
    const lockKey = `session:loop:${sessionId}`;
    const lockResult = await this.redis.set(lockKey, '1', 'EX', 60 * 60, 'NX');
    if (lockResult === null) {
      this.logger.log(
        `Loop for session ${sessionId} already running on another instance`,
      );
      return;
    }

    if (this.loops.has(sessionId)) return;

    const session = await this.sessionsService.findOneOrFail(sessionId);
    await this.redis.hset(winKey(sessionId), {
      two: 0,
      three: 0,
      four: 0,
      five: 0,
    });

    this.startLoop(sessionId, session.speedMs);
    this.logger.log(`Simulation started for session ${sessionId}`);
  }

  stop(sessionId: string): void {
    void this.redis.publish(
      CONTROL_CHANNEL,
      JSON.stringify({ type: 'stop', sessionId }),
    );
  }

  updateSpeed(sessionId: string, speedMs: number): void {
    void this.redis.publish(
      CONTROL_CHANNEL,
      JSON.stringify({ type: 'speed', sessionId, speedMs }),
    );
  }

  private startLoop(sessionId: string, speedMs: number): void {
    const tick = async () => {
      try {
        await this.runDraw(sessionId);
      } catch (err) {
        this.logger.error(`Draw error for session ${sessionId}`, err);
        this.stopLocal(sessionId);
      }
    };
    const handle = setInterval(() => void tick(), speedMs);
    this.loops.set(sessionId, handle);
  }

  private stopLocal(sessionId: string): void {
    const handle = this.loops.get(sessionId);
    if (handle) {
      clearInterval(handle);
      this.loops.delete(sessionId);
      void this.redis.del(winKey(sessionId));
      void this.redis.del(`session:loop:${sessionId}`);
      this.logger.log(`Simulation stopped for session ${sessionId}`);
    }
  }

  private restartLoop(sessionId: string, speedMs: number): void {
    const handle = this.loops.get(sessionId);
    if (!handle) return;
    clearInterval(handle);
    this.startLoop(sessionId, speedMs);
  }

  private async runDraw(sessionId: string): Promise<void> {
    const session = await this.sessionsService.findOneOrFail(sessionId);

    // Guard: stop if session was ended externally (e.g. DELETE hit a different instance)
    if (session.status !== SessionStatus.RUNNING) {
      this.stopLocal(sessionId);
      return;
    }

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
      await incrementWinInRedis(this.redis, sessionId, hits);
    }

    const wins = await getWinsFromRedis(this.redis, sessionId);
    const stats: DrawStats = buildStats(drawNumber, wins);
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
      this.stopLocal(sessionId);
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

function winKey(sessionId: string): string {
  return `winCounts:${sessionId}`;
}

async function incrementWinInRedis(
  redis: Redis,
  sessionId: string,
  hits: number,
): Promise<void> {
  const field =
    hits === 2 ? 'two' : hits === 3 ? 'three' : hits === 4 ? 'four' : 'five';
  await redis.hincrby(winKey(sessionId), field, 1);
}

async function getWinsFromRedis(
  redis: Redis,
  sessionId: string,
): Promise<WinCounts> {
  const data = await redis.hgetall(winKey(sessionId));
  return {
    two: parseInt(data.two ?? '0', 10),
    three: parseInt(data.three ?? '0', 10),
    four: parseInt(data.four ?? '0', 10),
    five: parseInt(data.five ?? '0', 10),
  };
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

function buildStats(totalDraws: number, wins: WinCounts): DrawStats {
  return {
    totalDraws,
    yearsElapsed: Math.floor(totalDraws / DRAWS_PER_YEAR),
    totalCost: totalDraws * TICKET_PRICE,
    wins,
  };
}
