import { Controller, Get, Post, Param, Body, Patch, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create-user')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('/login-user')
  login(@Body() loginUserDto: LoginUserDto) {
    console.log(loginUserDto);
    return this.usersService.login(loginUserDto);
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('/get-all-users')
  getAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get-specific-user/:id')
  getOne(@Param('id') id: string) {
    console.log(typeof id, id); 
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update-user/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete-user/:id')
  delete(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
