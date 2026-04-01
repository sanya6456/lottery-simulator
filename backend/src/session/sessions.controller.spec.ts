import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Session, SessionStatus } from '../lib/entities/session.entity';
import { WinningDraw } from '../lib/entities/winning-draw.entity';
import { SimulationService } from '../simulation/simulation.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSpeedDto } from './dto/update-speed.dto';
import { SessionsController } from './sessions.controller';
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

describe('SessionsController', () => {
  let controller: SessionsController;
  let sessionsService: jest.Mocked<SessionsService>;
  let simulationService: jest.Mocked<SimulationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [
        {
          provide: SessionsService,
          useValue: {
            create: jest.fn(),
            findOneOrFail: jest.fn(),
            updateSpeed: jest.fn(),
            end: jest.fn(),
            getWinningDraws: jest.fn(),
          },
        },
        {
          provide: SimulationService,
          useValue: {
            start: jest.fn().mockResolvedValue(undefined),
            stop: jest.fn(),
            updateSpeed: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SessionsController>(SessionsController);
    sessionsService = module.get(SessionsService);
    simulationService = module.get(SimulationService);
  });

  describe('create', () => {
    it('should call sessionsService.create and start a simulation', async () => {
      const dto: CreateSessionDto = {
        useRandomNumbers: true,
        playerNumbers: undefined,
        speedMs: 500,
      };
      const session = makeSession();
      sessionsService.create.mockResolvedValue(session);

      const result = await controller.create(dto);

      expect(sessionsService.create).toHaveBeenCalledWith(dto);
      expect(simulationService.start).toHaveBeenCalledWith(SESSION_ID);
      expect(result).toBe(session);
    });

    it('should pass player numbers when useRandomNumbers is false', async () => {
      const dto: CreateSessionDto = {
        useRandomNumbers: false,
        playerNumbers: [4, 17, 32, 55, 78],
        speedMs: 1000,
      };
      const session = makeSession({
        useRandomNumbers: false,
        playerNumbers: [4, 17, 32, 55, 78],
        speedMs: 1000,
      });
      sessionsService.create.mockResolvedValue(session);

      const result = await controller.create(dto);

      expect(sessionsService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(session);
    });
  });

  describe('findOne', () => {
    it('should return the session for the given id', async () => {
      const session = makeSession();
      sessionsService.findOneOrFail.mockResolvedValue(session);

      const result = await controller.findOne(SESSION_ID);

      expect(sessionsService.findOneOrFail).toHaveBeenCalledWith(SESSION_ID);
      expect(result).toBe(session);
    });

    it('should propagate NotFoundException when session does not exist', async () => {
      sessionsService.findOneOrFail.mockRejectedValue(
        new NotFoundException(`Session ${SESSION_ID} not found`),
      );

      await expect(controller.findOne(SESSION_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateSpeed', () => {
    it('should update the session speed and notify the simulation', async () => {
      const dto: UpdateSpeedDto = { speedMs: 200 };
      const updatedSession = makeSession({ speedMs: 200 });
      sessionsService.updateSpeed.mockResolvedValue(updatedSession);

      const result = await controller.updateSpeed(SESSION_ID, dto);

      expect(sessionsService.updateSpeed).toHaveBeenCalledWith(SESSION_ID, 200);
      expect(simulationService.updateSpeed).toHaveBeenCalledWith(
        SESSION_ID,
        200,
      );
      expect(result).toBe(updatedSession);
    });
  });

  describe('end', () => {
    it('should stop the simulation and mark the session as expired', async () => {
      sessionsService.end.mockResolvedValue(
        makeSession({ status: SessionStatus.EXPIRED, endedAt: new Date() }),
      );

      await controller.end(SESSION_ID);

      expect(simulationService.stop).toHaveBeenCalledWith(SESSION_ID);
      expect(sessionsService.end).toHaveBeenCalledWith(
        SESSION_ID,
        SessionStatus.EXPIRED,
      );
    });
  });

  describe('getWinningDraws', () => {
    it('should return winning draws for a session', async () => {
      const draws: WinningDraw[] = [
        {
          id: 'draw-uuid-1',
          sessionId: SESSION_ID,
          session: null as unknown as Session,
          drawNumber: 42,
          playerNumbers: [4, 17, 32, 55, 78],
          drawnNumbers: [4, 17, 32, 55, 78],
          hits: 5,
          drawnAt: new Date('2024-01-15T10:00:00Z'),
        },
      ];
      sessionsService.getWinningDraws.mockResolvedValue(draws);

      const result = await controller.getWinningDraws(SESSION_ID);

      expect(sessionsService.getWinningDraws).toHaveBeenCalledWith(SESSION_ID);
      expect(result).toBe(draws);
    });

    it('should return an empty array when there are no winning draws', async () => {
      sessionsService.getWinningDraws.mockResolvedValue([]);

      const result = await controller.getWinningDraws(SESSION_ID);

      expect(result).toEqual([]);
    });
  });
});
