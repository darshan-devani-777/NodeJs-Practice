import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeWebsocketAdapterDemo } from './websockets/websocket-demo';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/interceptors/all-exception.filter';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { config } from 'dotenv';

config();

import { createExpressAdapter } from './adapters/express.adapter';
import { createFastifyAdapter } from './adapters/fastify.adapter';
import { createCustomServer } from './adapters/custom.adapter';

async function bootstrap() {
  const adapterType = process.env.HTTP_ADAPTER || 'express';

  const ports = {
    express: Number(process.env.PORT_EXPRESS || 3000),
    fastify: Number(process.env.PORT_FASTIFY || 4000),
    custom: Number(process.env.PORT_CUSTOM || 5000),
  };

  let httpAdapter: any;

  if (adapterType === 'express') {
    httpAdapter = createExpressAdapter();
  }

  if (adapterType === 'fastify') {
    httpAdapter = createFastifyAdapter();
  }

  const app = await NestFactory.create(AppModule, httpAdapter);

  app.setGlobalPrefix('api', { exclude: [''] });
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  initializeWebsocketAdapterDemo(app);

  await app.init();

  const db = app.get<Connection>(getConnectionToken());
  if (db.readyState === 1) {
    console.log('✅ MongoDB connected...');
  } else {
    db.once('connected', () => console.log('✅ MongoDB connected...'));
    db.once('error', (err) =>
      console.error('❌ MongoDB connection error:', err),
    );
  }

  if (adapterType === 'express') {
    console.log('⚡ EXPRESS: ACTIVE');
  } else if (adapterType === 'fastify') {
    console.log('⚡ FASTIFY: ACTIVE');
  } else {
    console.log('⚡ CUSTOM SERVER: ACTIVE');
  }

  if (adapterType === 'custom') {
    const customServer = await createCustomServer(app);
    customServer.listen(ports.custom);
    console.log(
      `🚀 Server running at http://localhost:${ports.custom}`,
    );
    return;
  }

  const port = adapterType === 'express' ? ports.express : ports.fastify;
  await app.listen(port);

  if (adapterType === 'express') {
    console.log(`🚀 Server running at http://localhost:${port}`);
  } else {
    console.log(`🚀 Server running at http://localhost:${port}`);
  }
}

bootstrap();
