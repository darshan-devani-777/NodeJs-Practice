import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async create(@Body() body: { email: string; name: string }) {
    const user = await this.userService.createUser(body);
    return {
      success: true,
      message: 'User created successfully...',
      data: user,
    };
  }

  @Get()
  async getAll() {
    const users = await this.userService.getAllUsers();
    return {
      success: true,
      message: 'All users retrieved successfully...',
      data: users,
    };
  }

  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    try {
      const user = await this.userService.getUserById(id);
      return {
        success: true,
        message: `User with ID ${id} retrieved successfully...`,
        data: user,
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }  

  @Put(':id')
  async update(
    @Param('id' , ParseIntPipe) id: number,
    @Body() body: { email?: string; name?: string },
  ) {
    try {
      const updatedUser = await this.userService.updateUser(id, body);
      return {
        success: true,
        message: `User with ID ${id} updated successfully...`,
        data: updatedUser,
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Delete(':id')
  async delete(@Param('id' , ParseIntPipe) id: number) {
    try {
      const deletedUser = await this.userService.deleteUser(id);
      return {
        success: true,
        message: `User with ID ${id} deleted successfully...`,
        data: deletedUser,
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Put(':id/restore')
  async restoreUser(@Param('id', ParseIntPipe) id: number) {
    try {
      const restoredUser = await this.userService.restoreUser(id);
      return {
        success: true,
        message: `User with ID ${id} has been restored.`,
        data: restoredUser,
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
