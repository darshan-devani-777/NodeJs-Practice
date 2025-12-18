import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserLoggedInEvent } from '../events/user-logged-in.event';

@Injectable()
export class UserLoggedInListener {
  private readonly logger = new Logger(UserLoggedInListener.name);

  @OnEvent('user.logged-in')
  handleUserLoggedInEvent(event: UserLoggedInEvent) {
    this.logger.log('------------------------------------------');
    this.logger.log('📢 User Logged In Event Received');
    this.logger.log(`User ID: ${event.userId}`);
    this.logger.log(`Email: ${event.email}`);
    this.logger.log(`Login At: ${event.loginAt}`);
    this.logger.log('------------------------------------------');
  }
}
