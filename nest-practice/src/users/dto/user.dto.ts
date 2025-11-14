import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be one of: user, admin, moderator' })
  role?: UserRole;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  name?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  password?: string;
}

export class LoginUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
