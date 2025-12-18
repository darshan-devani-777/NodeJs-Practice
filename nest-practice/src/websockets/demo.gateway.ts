import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DemoGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DemoGateway.name);

  afterInit(server: Server) {
    this.logger.log('DemoGateway initialized - this triggers adapter.create()');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id} - this triggers adapter.bindClientConnect()`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any) {
    this.logger.log(`Message received from ${client.id}: ${JSON.stringify(payload)}`);
    return {
      event: 'response',
      data: `Echo: ${payload.message || 'Hello from server!'}`,
    };
  }
}

