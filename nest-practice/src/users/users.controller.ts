import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { UserThrottlerGuard } from '../auth/guards/user-throttler.guard';
import {
  SkipThrottle,
  DontSkipThrottle,
} from '../auth/decorators/skip-throttle.decorator';

@Controller('users')
@UseGuards(UserThrottlerGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create-user')
  @SkipThrottle()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('/login-user')
  @DontSkipThrottle()
  login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('/get-all-users')
  @DontSkipThrottle()
  getAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get-specific-user/:id')
  @DontSkipThrottle()
  getOne(@Param('id') id: string, @Req() req: any) {
    const currentUser = req.user as { id: string; role: UserRole } | undefined;

    if (!currentUser) {
      throw new ForbiddenException('User not authenticated');
    }

    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('You can only view your own profile');
    }

    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update-user/:id')
  @DontSkipThrottle()
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    const currentUser = req.user as { id: string; role: UserRole } | undefined;

    if (!currentUser) {
      throw new ForbiddenException('User not authenticated');
    }

    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    return this.usersService.update(id, updateUserDto);
  }

  // Admins can delete users
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('/delete-user/:id')
  @DontSkipThrottle()
  delete(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // Admins and moderators
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Get('/admin-only')
  @DontSkipThrottle()
  adminOnly() {
    return { message: 'This is an admin/moderator only endpoint' };
  }
}
