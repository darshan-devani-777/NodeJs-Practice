import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { DemoClientService } from './demo-client.service';

@Controller('microservices-demo')
export class DemoClientController {
  constructor(private readonly demoClient: DemoClientService) {}

  @Post('sum')
  async sum(@Body() body: { values?: number[] }) {
    const result = await firstValueFrom(this.demoClient.sum(body?.values ?? []));
    return { pattern: 'demo_sum', payload: body?.values ?? [], result };
  }

  @Get('ping')
  async ping(@Query('payload') payload?: string) {
    const result = await firstValueFrom(this.demoClient.ping(payload));
    return { pattern: 'demo_ping', payload: payload ?? 'ping', result };
  }
}

