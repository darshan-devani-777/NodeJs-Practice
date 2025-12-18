import { INestApplicationContext, Logger } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { MessageMappingProperties } from '@nestjs/websockets';

export class DemoWsAdapter extends WsAdapter {
  protected readonly logger = new Logger(DemoWsAdapter.name);

  constructor(app: INestApplicationContext) {
    super(app);
    this.logger.log('Initialized custom WsAdapter demo');
  }

  override create(port: number, options?: any) {
    this.logger.log(`create() invoked | port: ${port ?? 'inherit from HTTP server'}`);
    return super.create(port, options);
  }

  override bindClientConnect(server: any, callback: (...args: unknown[]) => void) {
    this.logger.log('bindClientConnect() invoked for WsAdapter');
    return super.bindClientConnect(server, callback);
  }

  override bindMessageHandlers(
    client: any,
    handlers: MessageMappingProperties[],
    transform: (data: any) => any,
  ) {
    this.logger.log(`bindMessageHandlers() | handlers registered: ${handlers.length}`);
    return super.bindMessageHandlers(client, handlers, transform);
  }

  override async close(server: any) {
    this.logger.log('close() invoked on WsAdapter');
    await super.close(server);
  }

  announceUsage(message: string) {
    this.logger.log(message);
  }
}

