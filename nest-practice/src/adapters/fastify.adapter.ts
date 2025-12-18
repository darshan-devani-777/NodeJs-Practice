import { FastifyAdapter } from '@nestjs/platform-fastify';

export function createFastifyAdapter() {
  return new FastifyAdapter({
    logger: true, 
  });
}
