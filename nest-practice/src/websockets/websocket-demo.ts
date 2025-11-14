import { INestApplication, Logger } from '@nestjs/common';
import { DemoIoAdapter } from './adapters/demo-io.adapter';
import { DemoWsAdapter } from './adapters/demo-ws.adapter';
import { DemoWebSocketAdapter } from './adapters/demo-websocket.adapter';

const logger = new Logger('WebSocketDemo');

export function initializeWebsocketAdapterDemo(app: INestApplication) {
  logger.log('═══════════════════════════════════════════════════════');
  logger.log('Initializing WebSocket Adapter Demos');
  logger.log('═══════════════════════════════════════════════════════');
  
  const ioAdapter = new DemoIoAdapter(app);
  const wsAdapter = new DemoWsAdapter(app);
  const baseAdapter = new DemoWebSocketAdapter();

  ioAdapter.announceUsage('IoAdapter ready ➜ registered as Nest global adapter');
  wsAdapter.announceUsage('WsAdapter ready ➜ instantiated for comparison');
  baseAdapter.announceUsage('WebSocketAdapter ready ➜ basic interface demo');

  app.useWebSocketAdapter(ioAdapter);
  
  logger.log('═══════════════════════════════════════════════════════');
  logger.log('Adapter methods will be called when:');
  logger.log('  • create() - Gateway initializes (afterInit)');
  logger.log('  • bindClientConnect() - Client connects');
  logger.log('  • bindMessageHandlers() - Message handlers registered');
  logger.log('  • close() - Server shuts down');
  logger.log('═══════════════════════════════════════════════════════');
}

