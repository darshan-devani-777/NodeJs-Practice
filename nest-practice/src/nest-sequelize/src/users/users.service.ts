import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Attributes } from 'sequelize';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  create(dto: CreateUserDto) {
    return this.userModel.create(dto as Attributes<User>);
  }

  findAll() {
    return this.userModel.findAll();
  }

  findOne(id: number) {
    return this.userModel.findByPk(id);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.update(dto);
  }

  async remove(id: number) {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.destroy();
  }
}
