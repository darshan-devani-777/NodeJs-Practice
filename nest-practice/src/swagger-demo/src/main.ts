// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  mongoose
    .connect('mongodb://localhost:27017/nest-swagger')
    .then(() => console.log('✅ MongoDB Connected...!'))
    .catch((err) =>
      console.error('❌ Failed to connect to MongoDB:', err.message),
    );
}

bootstrap();
