import { Test, TestingModule } from '@nestjs/testing';
import { WsGateway } from './ws.gateway';
import { Logger } from '@nestjs/common';

const mockClient = { id: 'test-client-id' };

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

  describe('handleMessage', () => {
    it('should log and return the received data', () => {
      const data = { text: 'hello' };

      const result = gateway.handleMessage(data, mockClient as never);

      expect(logSpy).toHaveBeenCalledWith(
        `Message from ${mockClient.id}: ${JSON.stringify(data)}`,
      );
      expect(result).toBe(data);
    });

    it('should handle primitive data', () => {
      const result = gateway.handleMessage('ping', mockClient as never);

      expect(result).toBe('ping');
    });
  });
});
