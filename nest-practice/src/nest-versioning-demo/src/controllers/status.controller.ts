import { Controller, Get, Version } from '@nestjs/common';
import { UsersService } from '../services/users.service';

@Controller('status')
export class StatusController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getNeutralStatus() {
    return {
      status: 'OK',
      message: 'Neutral route (no version)',
      users: this.usersService.getAllVersions(),
    };
  }

  @Get()
  @Version(['1', '2'])
  getVersionedStatus() {
    return {
      status: 'OK',
      message: 'Status available for v1 and v2',
      users: this.usersService.getAllVersions(),
    };
  }
}
