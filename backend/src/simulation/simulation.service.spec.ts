import { Test, TestingModule } from '@nestjs/testing';
import { SimulationService } from './simulation.service';
import { SessionsService } from '../session/sessions.service';
import { WsGateway } from '../lib/websocket/ws.gateway';
import { REDIS_CLIENT, REDIS_SUBSCRIBER } from '../lib/modules/redis.module';
import { Logger } from '@nestjs/common';
import { SessionStatus } from '../lib/entities/session.entity';

// Mock dependencies
const mockSessionsService = {
  findOneOrFail: jest.fn(),
  incrementDraws: jest.fn().mockResolvedValue(1),
  saveWinningDraw: jest.fn(),
  end: jest.fn(),
};

const mockServer = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
};

const mockWsGateway = {
  server: mockServer as unknown as import('socket.io').Server,
};

const mockRedisClient = {
  set: jest.fn(),
  hset: jest.fn(),
  hincrby: jest.fn(),
  hgetall: jest.fn(),
  del: jest.fn(),
  publish: jest.fn(),
};

const mockRedisSubscriber = {
  subscribe: jest.fn(),
  on: jest.fn(), // We'll capture the message handler here
};

describe('SimulationService', () => {
  let service: SimulationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulationService,
        { provide: SessionsService, useValue: mockSessionsService },
        { provide: WsGateway, useValue: mockWsGateway },
        { provide: REDIS_CLIENT, useValue: mockRedisClient },
        { provide: REDIS_SUBSCRIBER, useValue: mockRedisSubscriber },
      ],
    }).compile();

    service = module.get<SimulationService>(SimulationService);

    // Disable logger output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    // Use fake timers to test intervals
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('onModuleInit & onModuleDestroy', () => {
    it('should subscribe to the control channel on init', () => {
      service.onModuleInit();
      expect(mockRedisSubscriber.subscribe).toHaveBeenCalledWith(
        'session:control',
      );
      expect(mockRedisSubscriber.on).toHaveBeenCalledWith(
        'message',
        expect.any(Function),
      );
    });

    it('should clear all loops on destroy', () => {
      service['loops'].set('session-1', {
        handle: setTimeout(() => {}, 1000),
        speedMs: 1000,
        active: true,
      });
      service['loops'].set('session-2', {
        handle: setTimeout(() => {}, 1000),
        speedMs: 1000,
        active: true,
      });

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      service.onModuleDestroy();

      expect(clearTimeoutSpy).toHaveBeenCalledTimes(2);
      expect(mockRedisClient.del).toHaveBeenCalledWith('winCounts:session-1');
      expect(mockRedisClient.del).toHaveBeenCalledWith(
        'session:loop:session-1',
      );
      expect(mockRedisClient.del).toHaveBeenCalledWith('winCounts:session-2');
      expect(mockRedisClient.del).toHaveBeenCalledWith(
        'session:loop:session-2',
      );
      expect(service['loops'].size).toBe(0);
    });
  });

  describe('start', () => {
    it('should abort if loop lock fails (already running on another instance)', async () => {
      mockRedisClient.set.mockResolvedValueOnce(null);
      await service.start('session-1');
      expect(mockSessionsService.findOneOrFail).not.toHaveBeenCalled();
      expect(service['loops'].has('session-1')).toBe(false);
    });

    it('should abort if loop is already in local memory', async () => {
      mockRedisClient.set.mockResolvedValueOnce('OK');
      service['loops'].set('session-1', {
        handle: setTimeout(() => {}, 100),
        speedMs: 100,
        active: true,
      }); // fake running loop

      await service.start('session-1');

      expect(mockSessionsService.findOneOrFail).not.toHaveBeenCalled();
    });

    it('should initialize simulation state and start loop', async () => {
      mockRedisClient.set.mockResolvedValueOnce('OK');
      mockSessionsService.findOneOrFail.mockResolvedValueOnce({
        id: 'session-1',
        speedMs: 1000,
        status: SessionStatus.RUNNING,
      });

      await service.start('session-1');

      expect(mockRedisClient.hset).toHaveBeenCalledWith('winCounts:session-1', {
        two: 0,
        three: 0,
        four: 0,
        five: 0,
      });

      expect(service['loops'].has('session-1')).toBe(true);
    });
  });

  describe('stop & updateSpeed (pubsub)', () => {
    it('should publish stop message', () => {
      service.stop('session-1');
      expect(mockRedisClient.publish).toHaveBeenCalledWith(
        'session:control',
        JSON.stringify({ type: 'stop', sessionId: 'session-1' }),
      );
    });

    it('should publish speed message', () => {
      service.updateSpeed('session-1', 500);
      expect(mockRedisClient.publish).toHaveBeenCalledWith(
        'session:control',
        JSON.stringify({ type: 'speed', sessionId: 'session-1', speedMs: 500 }),
      );
    });

    it('should respond to control messages if it owns the loop', () => {
      // simulate module init
      let messageHandler: (channel: string, message: string) => void = () =>
        undefined;
      mockRedisSubscriber.on.mockImplementation((event, handler) => {
        if (event === 'message') {
          messageHandler = handler as (
            channel: string,
            message: string,
          ) => void;
        }
      });

      service.onModuleInit();

      // Inject a fake loop
      service['loops'].set('session-1', {
        handle: setTimeout(() => {}, 1000),
        speedMs: 1000,
        active: true,
      });
      const stopSpy = jest.spyOn(service as any, 'stopLocal');
      const restartSpy = jest.spyOn(service as any, 'restartLoop');

      // Ignore messages for other sessions
      messageHandler(
        'session:control',
        '{"type":"stop","sessionId":"other-session"}',
      );
      expect(stopSpy).not.toHaveBeenCalled();

      // Stop session
      messageHandler(
        'session:control',
        '{"type":"stop","sessionId":"session-1"}',
      );
      expect(stopSpy).toHaveBeenCalledWith('session-1');

      // Speed update — restartLoop now just mutates speedMs on the existing state
      service['loops'].set('session-1', {
        handle: setTimeout(() => {}, 1000),
        speedMs: 1000,
        active: true,
      }); // put back
      messageHandler(
        'session:control',
        '{"type":"speed","sessionId":"session-1","speedMs":500}',
      );
      expect(restartSpy).toHaveBeenCalledWith('session-1', 500);
      expect(service['loops'].get('session-1')?.speedMs).toBe(500);
    });
  });

  describe('runDraw execution (interval tick)', () => {
    beforeEach(() => {
      mockRedisClient.set.mockResolvedValue('OK');
      mockRedisClient.hgetall.mockResolvedValue({
        two: '10',
        three: '5',
        four: '2',
        five: '0',
      });
    });

    it('should stop locally if session status in DB is not RUNNING', async () => {
      mockSessionsService.findOneOrFail.mockResolvedValueOnce({
        id: 'session-1',
        status: SessionStatus.EXPIRED,
      });

      await (service as any).runDraw('session-1');

      // The draw function shouldn't proceed
      expect(mockSessionsService.incrementDraws).not.toHaveBeenCalled();
    });

    it('should proceed with draw and save stats successfully', async () => {
      mockSessionsService.findOneOrFail.mockResolvedValueOnce({
        id: 'session-1',
        status: SessionStatus.RUNNING,
        speedMs: 1000,
        totalDraws: 0,
        useRandomNumbers: false,
        playerNumbers: [1, 2, 3, 4, 5],
      });
      mockSessionsService.incrementDraws.mockResolvedValueOnce(1);

      await (service as any).runDraw('session-1');

      expect(mockSessionsService.incrementDraws).toHaveBeenCalledWith(
        'session-1',
      );
      expect(mockRedisClient.hgetall).toHaveBeenCalledWith(
        'winCounts:session-1',
      );
      expect(mockServer.to).toHaveBeenCalledWith('session-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'draw:result',
        expect.any(Object),
      );
    });

    it('should end session and stop loop if MAX_DRAWS is reached (expired)', async () => {
      mockSessionsService.findOneOrFail.mockResolvedValueOnce({
        id: 'session-max',
        status: SessionStatus.RUNNING,
        speedMs: 100,
        useRandomNumbers: true,
      });
      // Simulate that the atomic increment returns exactly 26 000
      mockSessionsService.incrementDraws.mockResolvedValueOnce(52 * 500);

      service['loops'].set('session-max', {
        handle: setTimeout(() => {}, 100),
        speedMs: 100,
        active: true,
      }); // fake running loop

      await (service as any).runDraw('session-max');

      // Should stop loop
      expect(service['loops'].has('session-max')).toBe(false);
      expect(mockSessionsService.end).toHaveBeenCalledWith(
        'session-max',
        SessionStatus.EXPIRED,
      );
      expect(mockServer.emit).toHaveBeenCalledWith(
        'session:ended',
        expect.objectContaining({
          reason: 'expired',
        }),
      );
    });
  });
});
