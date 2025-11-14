import { INestApplicationContext, Logger } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

export class DemoIoAdapter extends IoAdapter {
  private readonly logger = new Logger(DemoIoAdapter.name);

  constructor(app: INestApplicationContext) {
    super(app);
    this.logger.log('Initialized custom IoAdapter demo');
  }

  override create(port: number, options?: ServerOptions) {
    this.logger.log(`create() invoked | port: ${port ?? 'inherit from HTTP server'}`);
    return super.create(port, options);
  }

  override bindClientConnect(server: any, callback: (...args: unknown[]) => void) {
    this.logger.log('bindClientConnect() invoked for IoAdapter');
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
    this.logger.log('close() invoked on IoAdapter');
    await super.close(server);
  }

  announceUsage(message: string) {
    this.logger.log(message);
  }
}

