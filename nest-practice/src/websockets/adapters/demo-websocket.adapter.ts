import { Logger, WebSocketAdapter } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable, from } from 'rxjs';

export class DemoWebSocketAdapter implements WebSocketAdapter {
  private readonly logger = new Logger(DemoWebSocketAdapter.name);

  constructor() {
    this.logger.log('Initialized base WebSocketAdapter demo');
  }

  create(port: number, options?: Record<string, unknown>) {
    this.logger.log(`create() invoked | port: ${port ?? 'not provided'}`);
    return { port, options };
  }

  bindClientConnect(server: any, callback: (...args: unknown[]) => void) {
    this.logger.log('bindClientConnect() invoked for base adapter');
    return server;
  }

  bindMessageHandlers(
    _client: any,
    handlers: MessageMappingProperties[],
    _transform: (data: any) => Observable<any>,
  ): Observable<any> {
    this.logger.log(`bindMessageHandlers() | handlers registered: ${handlers.length}`);
    return from([]);
  }

  close(server: any) {
    this.logger.log('close() invoked on base adapter');
    return server;
  }

  announceUsage(message: string) {
    this.logger.log(message);
  }
}

