import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,                            
  BeforeUpdate,
} from 'sequelize-typescript';
import * as bcrypt from 'bcryptjs';

const notEmptyString = {
  allowNull: false,
  validate: { notEmpty: true },
};

@Table
export class User extends Model<User> {
  @Column({
    type: DataType.STRING,
    ...notEmptyString,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    ...notEmptyString,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    ...notEmptyString,
  })
  declare password: string;

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password') && instance.password) {
      const salt = await bcrypt.genSalt(10);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }
}
