import { ExpressAdapter } from '@nestjs/platform-express';

export function createExpressAdapter() {
  return new ExpressAdapter();
}
