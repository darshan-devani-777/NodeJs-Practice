import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(name: string, email: string): Promise<UserDocument> {
    if (!name || !email) {
      throw new BadRequestException('Name and email are required.');
    }

    try {
      const user = new this.userModel({ name, email });
      await user.save();
      this.logger.log(`User created: ${JSON.stringify(user)}`);
      return user;
    } catch (error) {
      this.logger.error('Error creating user', error);
      throw new Error('Failed to create user');
    }
  }

  async findAll(): Promise<UserDocument[]> {
    this.logger.log('Fetching all users');
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      this.logger.error('Error fetching users', error);
      throw new Error('Failed to fetch users');
    }
  }

  async findOne(id: string): Promise<UserDocument> {
    if (!id) {
      throw new BadRequestException('User ID must be provided');
    }

    let objectId: Types.ObjectId;
    try {
      objectId = new Types.ObjectId(id);
    } catch (err) {
      throw new BadRequestException('Invalid User ID format');
    }

    const user = await this.userModel.findById(objectId).exec();
    if (!user) {
      this.logger.warn(`User with id ${id} not found`);
      throw new NotFoundException(`User with id ${id} not found`);
    }

    this.logger.log(`User found: ${JSON.stringify(user)}`);
    return user;
  }

  async updateUser(
    id: string,
    name?: string,
    email?: string,
  ): Promise<UserDocument> {
    const user = await this.findOne(id);

    if (!name && !email) {
      throw new BadRequestException(
        'At least one field (name or email) must be provided.',
      );
    }

    if (name) user.name = name;
    if (email) user.email = email;

    try {
      await user.save();
      this.logger.log(`User updated: ${JSON.stringify(user)}`);
      return user;
    } catch (error) {
      this.logger.error(`Error updating user with id ${id}`, error);
      throw new Error('Failed to update user');
    }
  }

  async deleteUser(id: string): Promise<UserDocument | null> {
    const user = await this.findOne(id);
  
    try {
      await this.userModel.deleteOne({ _id: id }).exec();
      this.logger.log(`User deleted: ${JSON.stringify(user)}`);
      return user;  
    } catch (error) {
      this.logger.error(`Error deleting user with id ${id}`, error);
      throw new Error('Failed to delete user');
    }
  }  
}
