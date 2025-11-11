export class UsersRetrievedEvent {
  constructor(
    public readonly count: number,
    public readonly retrievedAt: Date,
  ) {}
}

