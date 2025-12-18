import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './services/user.service';
import { User, UserSchema } from './schemas/user.schema';

const mongoLogger = new Logger('MongoDB');

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: 'mongodb://localhost/nestjs-repl-demo',
        connectionFactory: (connection) => {
          connection.once('open', () => mongoLogger.log('✅ MongoDB connection successful!'));
          connection.on('error', (err) => mongoLogger.error(`❌ MongoDB connection error: ${err.message}`));
          connection.on('disconnected', () => mongoLogger.warn('⚠️ MongoDB disconnected'));
          return connection;
        },
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService, UserService],
})
export class AppModule {}
