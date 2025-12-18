import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserUpdatedEvent } from '../events/user-updated.event';

@Injectable()
export class UserUpdatedListener {
  private readonly logger = new Logger(UserUpdatedListener.name);

  @OnEvent('user.updated')
  handleUserUpdatedEvent(event: UserUpdatedEvent) {
    this.logger.log('------------------------------------------');
    this.logger.log('📢 User Updated Event Received');
    this.logger.log(`User ID: ${event.userId}`);
    this.logger.log(`Email: ${event.email}`);
    this.logger.log(
      `Updated Fields: ${JSON.stringify(event.updatedFields, null, 2)}`,
    );
    this.logger.log(`Updated At: ${event.updatedAt}`);
    this.logger.log('------------------------------------------');
  }
}
