import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: RegisterDto): Promise<User> {
    console.log("CREATING USER:", createUserDto);
    const savedUser = await new this.userModel(createUserDto).save();
    console.log("USER SAVED:", savedUser);
    return savedUser;
  }

  findAll() {
    return this.userModel.find().select('-password');
  }

  findOne(id: string) {
    return this.userModel.findById(id).select('-password');
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      console.log("HASHING PASSWORD FOR UPDATE:", updateUserDto.password);
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password');
    console.log("UPDATED USER:", updatedUser);
    return updatedUser;
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}


