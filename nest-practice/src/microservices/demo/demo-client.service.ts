import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export const DEMO_MICRO_CLIENT = 'DEMO_MICRO_CLIENT';

@Injectable()
export class DemoClientService {
  constructor(@Inject(DEMO_MICRO_CLIENT) private readonly client: ClientProxy) {}

  sum(values: number[]): Observable<number> {
    return this.client.send({ cmd: 'demo_sum' }, values);
  }

  ping(payload?: string): Observable<string> {
    return this.client.send({ cmd: 'demo_ping' }, payload ?? 'ping');
  }
}

