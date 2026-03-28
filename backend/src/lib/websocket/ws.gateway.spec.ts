import { Test, TestingModule } from '@nestjs/testing';
import { WsGateway } from './ws.gateway';
import { Logger } from '@nestjs/common';

const mockClient = { id: 'test-client-id', join: jest.fn(), leave: jest.fn() };

describe('WsGateway', () => {
  let gateway: WsGateway;
  let logSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WsGateway],
    }).compile();

    gateway = module.get<WsGateway>(WsGateway);
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should log client connection', () => {
      gateway.handleConnection(mockClient as never);

      expect(logSpy).toHaveBeenCalledWith(`Client connected: ${mockClient.id}`);
    });
  });

  describe('handleDisconnect', () => {
    it('should log client disconnection', () => {
      gateway.handleDisconnect(mockClient as never);

      expect(logSpy).toHaveBeenCalledWith(
        `Client disconnected: ${mockClient.id}`,
      );
    });
  });

  describe('handleJoin', () => {
    it('should join room and log', () => {
      gateway.handleJoin({ sessionId: 'session-1' }, mockClient as never);

      expect(mockClient.join).toHaveBeenCalledWith('session-1');
      expect(logSpy).toHaveBeenCalledWith(
        `Client ${mockClient.id} joined session session-1`,
      );
    });
  });

  describe('handleLeave', () => {
    it('should leave room and log', () => {
      gateway.handleLeave({ sessionId: 'session-1' }, mockClient as never);

      expect(mockClient.leave).toHaveBeenCalledWith('session-1');
      expect(logSpy).toHaveBeenCalledWith(
        `Client ${mockClient.id} left session session-1`,
      );
    });
  });
});
