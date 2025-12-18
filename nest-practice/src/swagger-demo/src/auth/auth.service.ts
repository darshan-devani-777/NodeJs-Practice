import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(data: { name: string; email: string; password: string }) {
    console.log("REGISTER REQUEST DATA:", data);

    const existing = await this.usersService.findByEmail(data.email);
    if (existing) {
      console.log("EMAIL ALREADY EXISTS:", data.email);
      throw new UnauthorizedException('Email already exists');
    }

    const hashed = await bcrypt.hash(data.password, 10);
    console.log("HASHED PASSWORD:", hashed);

    const user = await this.usersService.create({
      name: data.name,
      email: data.email,
      password: hashed,
    });

    console.log("USER REGISTERED:", user);

    return {
      message: 'User registered successfully',
      user,
    };
  }

  async login(email: string, password: string) {
    console.log("LOGIN REQUEST:", { email, password });

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      console.log("USER NOT FOUND:", email);
      throw new UnauthorizedException('User not found');
    }

    console.log("STORED PASSWORD:", user.password);
    const match = await bcrypt.compare(password, user.password);
    console.log("PASSWORD MATCH RESULT:", match);

    if (!match) {
      console.log("INVALID PASSWORD ENTERED:", password);
      throw new UnauthorizedException('Invalid password');
    }

    const token = this.jwtService.sign(
      { sub: user._id, email: user.email },
      { secret: 'SECRET_KEY' }
    );

    console.log("JWT GENERATED:", token);

    return { token };
  }
}

