import { Injectable } from '@nestjs/common';

@Injectable()
export class DemoService {
  sum(values: number[] = []): number {
    return values.map((value) => Number(value) || 0).reduce((acc, value) => acc + value, 0);
  }

  ping(payload = 'pong'): string {
    return `microservice-response:${payload}`;
  }
}

