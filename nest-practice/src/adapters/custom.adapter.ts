import { HttpAdapterHost } from '@nestjs/core';
import * as http from 'http';

export async function createCustomServer(app: any) {
  const server = http.createServer((req, res) => {
    const { httpAdapter } = app.get(HttpAdapterHost);

    httpAdapter.getHttpServer().emit('request', req, res);
  });

  return server;
}
