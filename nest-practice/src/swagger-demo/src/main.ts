import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Nest With Swagger')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 

  await app.listen(3000);
  console.log(`🚀 Server Start on http://localhost:3000`);
  console.log(`📄 Swagger docs at http://localhost:3000/api`);

  mongoose
    .connect('mongodb://localhost:27017/nest-swagger')
    .then(() => console.log('✅ MongoDB Connected...!'))
    .catch((err) =>
      console.error('❌ Failed to connect to MongoDB:', err.message),
    );
}

bootstrap();
