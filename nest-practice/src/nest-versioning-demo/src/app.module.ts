import { Module } from '@nestjs/common';
import { UsersV1Controller } from './controllers/users.v1.controller';
import { UsersV2Controller } from './controllers/users.v2.controller';
import { StatusController } from './controllers/status.controller';
import { UsersService } from './services/users.service';

@Module({
  controllers: [UsersV1Controller, UsersV2Controller, StatusController],
  providers: [UsersService],
})
export class AppModule {}
