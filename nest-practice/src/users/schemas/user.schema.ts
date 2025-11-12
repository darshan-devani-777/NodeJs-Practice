import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Query } from 'mongoose';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: false,
    versionKey: false,
    transform: (_doc, ret: Record<string, any>) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      delete ret.__v;
      return { id: ret.id, ...ret }; 
    },    
  },
  toObject: {
    virtuals: false,
    versionKey: false,
    transform: (_doc, ret: Record<string, any>) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      delete ret.__v;
      return { id: ret.id, ...ret }; 
    },    
  },
})

export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ 
    type: String, 
    enum: Object.values(UserRole), 
    default: UserRole.USER 
  })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hash password 
 UserSchema.pre<User>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Exclude password
UserSchema.pre<Query<any, User>>(/^find/, function (next) {
  const includePassword = this.getOptions().includePassword;

  if (!includePassword) {
    this.select('-password');
  }

  next();
});
