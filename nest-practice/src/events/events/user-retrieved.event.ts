export class UserRetrievedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly retrievedAt: Date,
  ) {}
}
