export class UserUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly updatedFields: Record<string, any>,
    public readonly updatedAt: Date,
  ) {}
}
