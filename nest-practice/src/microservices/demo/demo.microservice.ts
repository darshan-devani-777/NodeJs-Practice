import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { MicroservicesModule } from '../microservices.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(MicroservicesModule);
  const configService = appContext.get(ConfigService);

  const host = configService.get<string>('MICROSERVICE_HOST', '127.0.0.1');
  const port = configService.get<number>('MICROSERVICE_PORT', 4001);

  const app = await NestFactory.createMicroservice(MicroservicesModule, {
    transport: Transport.TCP,
    options: { host, port },
  });

  await app.listen();
  console.log(`🚀 Microservice started on tcp://${host}:${port}`);
}

void bootstrap();
