export let users: User[] = [];

export class User {
    constructor(
        public id: number,
        public name: string,
        public email: string
    ) {}
}