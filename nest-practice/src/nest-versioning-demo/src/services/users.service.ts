import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getV1Users() {
    return { version: '1', users: ['John', 'Doe'] };
  }

  getV2Users() {
    return { version: '2', users: ['Alice', 'Bob', 'Charlie'] };
  }

  getAllVersions() {
    return {
      v1: this.getV1Users(),
      v2: this.getV2Users(),
    };
  }
}
