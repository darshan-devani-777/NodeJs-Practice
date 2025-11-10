import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from './dto/user.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
  
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string; user: Record<string, any> }> {
    const user = await this.userModel
      .findOne({ email: loginUserDto.email })
      .setOptions({ includePassword: true })
      .select('+password')
      .exec();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload);
    const userData = user.toObject();

    return {
      accessToken,
      user: userData,
    };
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true },
    ).exec();
  }

  async remove(id: string): Promise<{ deleted: boolean; user?: User | null }> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
  
    return {
      deleted: !!result,
      user: result || null, 
    };
  }  
}
