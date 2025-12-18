import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UsersRetrievedEvent } from '../events/users-retrieved.event';

@Injectable()
export class UsersRetrievedListener {
  private readonly logger = new Logger(UsersRetrievedListener.name);

  @OnEvent('users.retrieved')
  handleUsersRetrievedEvent(event: UsersRetrievedEvent) {
    this.logger.log('------------------------------------------');
    this.logger.log('📢 Users Retrieved Event Received');
    this.logger.log(`Total Users: ${event.count}`);
    this.logger.log(`Retrieved At: ${event.retrievedAt}`);
    this.logger.log('------------------------------------------');
  }
}
