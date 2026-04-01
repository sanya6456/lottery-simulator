import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { Session, SessionStatus } from '../lib/entities/session.entity';
import { WinningDraw } from '../lib/entities/winning-draw.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import {
  SESSION_REPOSITORY,
  WINNING_DRAW_REPOSITORY,
} from './session.repository';
import { SessionsService } from './sessions.service';

const SESSION_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: SESSION_ID,
    status: SessionStatus.RUNNING,
    useRandomNumbers: true,
    playerNumbers: null,
    speedMs: 500,
    totalDraws: 0,
    startedAt: new Date('2024-01-01T00:00:00Z'),
    endedAt: null,
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    winningDraws: [],
    ...overrides,
  };
}

describe('SessionsService', () => {
  let service: SessionsService;
  let sessionRepository: jest.Mocked<Repository<Session>>;
  let winningDrawRepository: jest.Mocked<Repository<WinningDraw>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: SESSION_REPOSITORY,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            increment: jest.fn(),
          },
        },
        {
          provide: WINNING_DRAW_REPOSITORY,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    sessionRepository = module.get(SESSION_REPOSITORY);
    winningDrawRepository = module.get(WINNING_DRAW_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a session with random numbers', async () => {
      const dto: CreateSessionDto = {
        useRandomNumbers: true,
        playerNumbers: undefined,
        speedMs: 500,
      };

      const createdSession = {
        useRandomNumbers: true,
        playerNumbers: null,
        speedMs: 500,
      } as Session;
      const expectedSession = makeSession();

      sessionRepository.create.mockReturnValue(createdSession);
      sessionRepository.save.mockResolvedValue(expectedSession);

      const result = await service.create(dto);

      expect(sessionRepository.create).toHaveBeenCalledWith({
        useRandomNumbers: true,
        playerNumbers: null,
        speedMs: 500,
      });
      expect(sessionRepository.save).toHaveBeenCalledWith(createdSession);
      expect(result).toEqual(expectedSession);
    });

    it('should create and save a session with specific player numbers', async () => {
      const dto: CreateSessionDto = {
        useRandomNumbers: false,
        playerNumbers: [1, 2, 3, 4, 5],
        speedMs: undefined,
      };

      const createdSession = {
        useRandomNumbers: false,
        playerNumbers: [1, 2, 3, 4, 5],
        speedMs: 1000,
      } as Session;
      const expectedSession = makeSession({ ...createdSession });

      sessionRepository.create.mockReturnValue(createdSession);
      sessionRepository.save.mockResolvedValue(expectedSession);

      const result = await service.create(dto);

      expect(sessionRepository.create).toHaveBeenCalledWith({
        useRandomNumbers: false,
        playerNumbers: [1, 2, 3, 4, 5],
        speedMs: 1000, // defaults to 1000
      });
      expect(sessionRepository.save).toHaveBeenCalledWith(createdSession);
      expect(result).toEqual(expectedSession);
    });
  });

  describe('findOneOrFail', () => {
    it('should return a session if found', async () => {
      const session = makeSession();
      sessionRepository.findOneBy.mockResolvedValue(session);

      const result = await service.findOneOrFail(SESSION_ID);

      expect(sessionRepository.findOneBy).toHaveBeenCalledWith({
        id: SESSION_ID,
      });
      expect(result).toEqual(session);
    });

    it('should throw NotFoundException if not found', async () => {
      sessionRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOneOrFail(SESSION_ID)).rejects.toThrow(
        new NotFoundException(`Session ${SESSION_ID} not found`),
      );
      expect(sessionRepository.findOneBy).toHaveBeenCalledWith({
        id: SESSION_ID,
      });
    });
  });

  describe('updateSpeed', () => {
    it('should update and save the new speed', async () => {
      const session = makeSession({ speedMs: 500 });
      sessionRepository.findOneBy.mockResolvedValue(session);

      const updatedSession = makeSession({ speedMs: 200 });
      sessionRepository.save.mockResolvedValue(updatedSession);

      const result = await service.updateSpeed(SESSION_ID, 200);

      expect(sessionRepository.findOneBy).toHaveBeenCalledWith({
        id: SESSION_ID,
      });
      expect(session.speedMs).toBe(200);
      expect(sessionRepository.save).toHaveBeenCalledWith(session);
      expect(result).toEqual(updatedSession);
    });

    it('should throw NotFoundException if session not found', async () => {
      sessionRepository.findOneBy.mockResolvedValue(null);
      await expect(service.updateSpeed(SESSION_ID, 200)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('end', () => {
    it('should update status and endedAt, then save', async () => {
      const session = makeSession({
        status: SessionStatus.RUNNING,
        endedAt: null,
      });
      sessionRepository.findOneBy.mockResolvedValue(session);

      const endedSession = makeSession({
        status: SessionStatus.EXPIRED,
        endedAt: new Date(),
      });
      sessionRepository.save.mockResolvedValue(endedSession);

      const beforeDate = new Date();
      const result = await service.end(SESSION_ID, SessionStatus.EXPIRED);
      const afterDate = new Date();

      expect(sessionRepository.findOneBy).toHaveBeenCalledWith({
        id: SESSION_ID,
      });
      expect(session.status).toBe(SessionStatus.EXPIRED);
      expect(session.endedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeDate.getTime(),
      );
      expect(session.endedAt!.getTime()).toBeLessThanOrEqual(
        afterDate.getTime(),
      );
      expect(sessionRepository.save).toHaveBeenCalledWith(session);
      expect(result).toEqual(endedSession);
    });
  });

  describe('incrementDraws', () => {
    it('should call increment on the repository', async () => {
      sessionRepository.increment.mockResolvedValue({
        generatedMaps: [],
        raw: [],
      });

      await service.incrementDraws(SESSION_ID);

      expect(sessionRepository.increment).toHaveBeenCalledWith(
        { id: SESSION_ID },
        'totalDraws',
        1,
      );
    });
  });

  describe('getWinningDraws', () => {
    it('should find draws by session id', async () => {
      const draws = [{ id: 'draw1' }] as WinningDraw[];
      winningDrawRepository.findBy.mockResolvedValue(draws);

      const result = await service.getWinningDraws(SESSION_ID);

      expect(winningDrawRepository.findBy).toHaveBeenCalledWith({
        sessionId: SESSION_ID,
      });
      expect(result).toEqual(draws);
    });
  });

  describe('saveWinningDraw', () => {
    it('should create and save a winning draw', async () => {
      const data = {
        sessionId: SESSION_ID,
        drawNumber: 1,
        playerNumbers: [1, 2, 3, 4, 5],
        drawnNumbers: [1, 2, 3, 4, 5],
        hits: 5,
      };

      const createdDraw = { ...data } as WinningDraw;
      const expectedDraw = { ...createdDraw, id: 'draw1' } as WinningDraw;

      winningDrawRepository.create.mockReturnValue(createdDraw);
      winningDrawRepository.save.mockResolvedValue(expectedDraw);

      const result = await service.saveWinningDraw(data);

      expect(winningDrawRepository.create).toHaveBeenCalledWith(data);
      expect(winningDrawRepository.save).toHaveBeenCalledWith(createdDraw);
      expect(result).toEqual(expectedDraw);
    });
  });
});
