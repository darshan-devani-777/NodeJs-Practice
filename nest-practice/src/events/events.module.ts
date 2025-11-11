import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserCreatedListener } from './listeners/user-created.listener';
import { UserUpdatedListener } from './listeners/user-updated.listener';
import { UserDeletedListener } from './listeners/user-deleted.listener';
import { UserLoggedInListener } from './listeners/user-logged-in.listener';
import { UsersRetrievedListener } from './listeners/users-retrieved.listener';
import { UserRetrievedListener } from './listeners/user-retrieved.listener';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      // Global event emitter
      wildcard: false,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
  ],
  providers: [
    UserCreatedListener,
    UserUpdatedListener,
    UserDeletedListener,
    UserLoggedInListener,
    UsersRetrievedListener,
    UserRetrievedListener,
  ],
  exports: [EventEmitterModule],
})
export class EventsModule {}

