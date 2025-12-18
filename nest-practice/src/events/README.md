# Events Module

This module implements an event-driven architecture using NestJS EventEmitter.

## Structure

```
events/
├── events/           # Event classes
│   ├── user-created.event.ts
│   ├── user-updated.event.ts
│   ├── user-deleted.event.ts
│   ├── user-logged-in.event.ts
│   └── index.ts
├── listeners/        # Event listeners
│   ├── user-created.listener.ts
│   ├── user-updated.listener.ts
│   ├── user-deleted.listener.ts
│   ├── user-logged-in.listener.ts
│   └── index.ts
├── events.module.ts  # Events module configuration
└── README.md
```

## How It Works

### 1. Event Classes
Event classes define the data structure for events. They are simple classes with properties.

Example:
```typescript
export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly createdAt: Date,
  ) {}
}
```

### 2. Event Listeners
Listeners handle events when they are emitted. They use the `@OnEvent()` decorator.

Example:
```typescript
@Injectable()
export class UserCreatedListener {
  @OnEvent('user.created')
  handleUserCreatedEvent(event: UserCreatedEvent) {
    // Handle the event
    console.log('User created:', event.userId);
  }
}
```

### 3. Emitting Events
Events are emitted using `EventEmitter2` injected into services.

Example:
```typescript
constructor(private readonly eventEmitter: EventEmitter2) {}

async create(userDto: CreateUserDto) {
  const user = await this.userModel.create(userDto);
  
  // Emit event
  this.eventEmitter.emit(
    'user.created',
    new UserCreatedEvent(user.id, user.email, user.name, new Date())
  );
  
  return user;
}
```

## Available Events

1. **user.created** - Emitted when a new user is created
2. **user.updated** - Emitted when a user is updated
3. **user.deleted** - Emitted when a user is deleted
4. **user.logged-in** - Emitted when a user logs in
5. **users.retrieved** - Emitted when all users are retrieved (GET /users/get-all-users)
6. **user.retrieved** - Emitted when a specific user is retrieved (GET /users/get-specific-user/:id)

## Usage Examples

### Adding a New Event

1. Create an event class in `events/`:
```typescript
export class UserVerifiedEvent {
  constructor(
    public readonly userId: string,
    public readonly verifiedAt: Date,
  ) {}
}
```

2. Create a listener in `listeners/`:
```typescript
@Injectable()
export class UserVerifiedListener {
  @OnEvent('user.verified')
  handleUserVerifiedEvent(event: UserVerifiedEvent) {
  }
}
```

3. Register the listener in `events.module.ts`
4. Emit the event in your service:
```typescript
this.eventEmitter.emit('user.verified', new UserVerifiedEvent(userId, new Date()));
```

## Benefits

- **Decoupling**: Services don't need to know about all the side effects
- **Extensibility**: Easy to add new listeners without modifying existing code
- **Maintainability**: Clear separation of concerns
- **Testability**: Easy to mock and test event handlers

