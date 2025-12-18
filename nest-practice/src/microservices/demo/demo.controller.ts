import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DemoService } from './demo.service';

@Controller()
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @MessagePattern({ cmd: 'demo_sum' })
  handleSum(@Payload() values: number[]): number {
    return this.demoService.sum(values);
  }

  @MessagePattern({ cmd: 'demo_ping' })
  handlePing(@Payload() payload: string): string {
    return this.demoService.ping(payload);
  }
}

