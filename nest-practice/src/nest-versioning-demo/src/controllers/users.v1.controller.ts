import { Controller, Get } from '@nestjs/common';
import { UsersService } from '../services/users.service';

@Controller({ path: 'users', version: '1' })
export class UsersV1Controller {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.getV1Users();
  }
}
