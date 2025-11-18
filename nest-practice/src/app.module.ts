import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { Connection } from 'mongoose';
import { DemoClientModule } from './microservices/demo/demo-client.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/nest_practice'),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 10,
      },
    ]),
    EventsModule,
    UsersModule,
    WebsocketsModule,
    DemoClientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements OnApplicationBootstrap {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onApplicationBootstrap() {
    if (this.connection.readyState === 1) {
      console.log('✅ MongoDB connected...');
    } else {
      this.connection.once('connected', () => console.log('✅ MongoDB connected...'));
      this.connection.once('error', (err) => console.error('❌ MongoDB connection error:', err));
    }
  }
}
