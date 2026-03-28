import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

type WsClient = {
  id: string;
  join: (room: string) => void;
  leave: (room: string) => void;
};

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
  },
})
export class WsGateway
  implements OnGatewayConnection<WsClient>, OnGatewayDisconnect<WsClient>
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WsGateway.name);

  handleConnection(client: WsClient) {
    this.logger.log(`Client connected: ${client?.id}`);
  }

  handleDisconnect(client: WsClient) {
    this.logger.log(`Client disconnected: ${client?.id}`);
  }

  @SubscribeMessage('session:join')
  handleJoin(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    void client.join(data.sessionId);
    this.logger.log(`Client ${client?.id} joined session ${data.sessionId}`);
  }

  @SubscribeMessage('session:leave')
  handleLeave(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    void client.leave(data.sessionId);
    this.logger.log(`Client ${client?.id} left session ${data.sessionId}`);
  }
}
