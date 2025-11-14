import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from './dto/user.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserCreatedEvent } from '../events/events/user-created.event';
import { UserUpdatedEvent } from '../events/events/user-updated.event';
import { UserDeletedEvent } from '../events/events/user-deleted.event';
import { UserLoggedInEvent } from '../events/events/user-logged-in.event';
import { UsersRetrievedEvent } from '../events/events/users-retrieved.event';
import { UserRetrievedEvent } from '../events/events/user-retrieved.event';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const newUser = new this.userModel(createUserDto);
    const savedUser = await newUser.save();
    const userObject = savedUser.toObject() as any;

    // Emit user created event
    this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(
        userObject.id || userObject._id?.toString(),
        userObject.email,
        userObject.name,
        userObject.createdAt || new Date(),
      ),
    );

    return savedUser;
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string; user: Record<string, any> }> {
    const user = await this.userModel
      .findOne({ email: loginUserDto.email })
      .setOptions({ includePassword: true })
      .select('+password')
      .exec();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload);
    const userData = user.toObject();

    // Emit user logged in event
    this.eventEmitter.emit(
      'user.logged-in',
      new UserLoggedInEvent(
        userData.id || userData._id?.toString(),
        userData.email,
        new Date(),
      ),
    );

    return {
      accessToken,
      user: userData,
    };
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().exec();

    // Emit users retrieved event
    this.eventEmitter.emit(
      'users.retrieved',
      new UsersRetrievedEvent(users.length, new Date()),
    );

    return users;
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();

    if (user) {
      const userObject = user.toObject() as any;

      // Emit user retrieved event
      this.eventEmitter.emit(
        'user.retrieved',
        new UserRetrievedEvent(
          userObject.id || userObject._id?.toString(),
          userObject.email,
          new Date(),
        ),
      );
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();

    if (updatedUser) {
      const userObject = updatedUser.toObject() as any;

      // Emit user updated event
      this.eventEmitter.emit(
        'user.updated',
        new UserUpdatedEvent(
          userObject.id || userObject._id?.toString(),
          userObject.email,
          updateUserDto,
          userObject.updatedAt || new Date(),
        ),
      );
    }

    return updatedUser;
  }

  async remove(id: string): Promise<{ deleted: boolean; user?: User | null }> {
    const result = await this.userModel.findByIdAndDelete(id).exec();

    if (result) {
      const userObject = result.toObject();

      // Emit user deleted event
      this.eventEmitter.emit(
        'user.deleted',
        new UserDeletedEvent(
          userObject.id || userObject._id?.toString(),
          userObject.email,
          new Date(),
        ),
      );
    }

    return {
      deleted: !!result,
      user: result || null,
    };
  }
}
