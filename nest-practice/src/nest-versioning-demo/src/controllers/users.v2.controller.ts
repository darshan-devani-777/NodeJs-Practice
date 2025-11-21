import { Controller, Get } from '@nestjs/common';
import { UsersService } from '../services/users.service';

@Controller({ path: 'users', version: '2' })
export class UsersV2Controller {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.getV2Users();
  }
}
