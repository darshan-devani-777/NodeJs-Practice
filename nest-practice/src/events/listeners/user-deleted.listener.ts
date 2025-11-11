import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserDeletedEvent } from '../events/user-deleted.event';

@Injectable()
export class UserDeletedListener {
  private readonly logger = new Logger(UserDeletedListener.name);

  @OnEvent('user.deleted')
  handleUserDeletedEvent(event: UserDeletedEvent) {
    this.logger.log('------------------------------------------');
    this.logger.log('📢 User Deleted Event Received');
    this.logger.log(`User ID: ${event.userId}`);
    this.logger.log(`Email: ${event.email}`);
    this.logger.log(`Deleted At: ${event.deletedAt}`);
    this.logger.log('------------------------------------------');
  }
}

