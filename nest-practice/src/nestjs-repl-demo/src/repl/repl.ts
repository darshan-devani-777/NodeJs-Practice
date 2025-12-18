import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import * as repl from 'repl';
import { Logger } from '@nestjs/common';
import { AppService } from '../app.service';
import { UserService } from '../services/user.service';
import * as mongoose from 'mongoose';

async function startDynamicRepl() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('REPL');

  const mongoUri = 'mongodb://localhost/nestjs-repl-demo';
  mongoose
    .connect(mongoUri)
    .then(() => logger.log('✅ MongoDB connection successful!'))
    .catch((err) => logger.error('❌ MongoDB connection error: ', err));

  logger.log('Starting dynamic NestJS REPL...');

  const replServer = repl.start({
    prompt: 'nestjs> ',
    useColors: true,
  });

  const servicesToExpose = [AppService, UserService];

  for (const serviceClass of servicesToExpose) {
    try {
      const instance = app.get(serviceClass);
      const name =
        serviceClass.name.charAt(0).toLowerCase() + serviceClass.name.slice(1);
      replServer.context[name] = instance;
      logger.log(`Service loaded into REPL: ${name}`);
    } catch (err) {
      logger.warn(`Could not load service: ${serviceClass.name}`);
    }
  }

  replServer.context.logger = logger;

  replServer.on('exit', async () => {
    logger.log('Exiting REPL...');
    await app.close();
    process.exit();
  });
}

startDynamicRepl();
