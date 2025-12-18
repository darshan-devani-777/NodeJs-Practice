import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DemoController } from './demo/demo.controller';
import { DemoService } from './demo/demo.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,         
      envFilePath: '.env',      
    }),
  ],
  controllers: [DemoController],
  providers: [DemoService],
})
export class MicroservicesModule {}

