import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserRetrievedEvent } from '../events/user-retrieved.event';

@Injectable()
export class UserRetrievedListener {
  private readonly logger = new Logger(UserRetrievedListener.name);

  @OnEvent('user.retrieved')
  handleUserRetrievedEvent(event: UserRetrievedEvent) {
    this.logger.log('------------------------------------------');
    this.logger.log('📢 User Retrieved Event Received');
    this.logger.log(`User ID: ${event.userId}`);
    this.logger.log(`Email: ${event.email}`);
    this.logger.log(`Retrieved At: ${event.retrievedAt}`);
    this.logger.log('------------------------------------------');
  }
}

