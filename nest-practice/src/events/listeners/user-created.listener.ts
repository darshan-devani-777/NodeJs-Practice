import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../events/user-created.event';

@Injectable()
export class UserCreatedListener {
  private readonly logger = new Logger(UserCreatedListener.name);

  @OnEvent('user.created')
  handleUserCreatedEvent(event: UserCreatedEvent) {
    this.logger.log('------------------------------------------');
    this.logger.log('📢 User Created Event Received');
    this.logger.log(`User ID: ${event.userId}`);
    this.logger.log(`Email: ${event.email}`);
    this.logger.log(`Name: ${event.name}`);
    this.logger.log(`Created At: ${event.createdAt}`);
    this.logger.log('------------------------------------------');
  }
}
