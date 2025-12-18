import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DemoClientController } from './demo-client.controller';
import { DemoClientService, DEMO_MICRO_CLIENT } from './demo-client.service';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: DEMO_MICRO_CLIENT,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('MICROSERVICE_HOST', '127.0.0.1'),
            port: Number(configService.get<number>('MICROSERVICE_PORT', 4001)),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [DemoClientController],
  providers: [DemoClientService],
  exports: [DemoClientService],
})
export class DemoClientModule {}

