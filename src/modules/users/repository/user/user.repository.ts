import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './user.repository-types';
import { UserMapper } from './user.mapper';
import { User as UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(user: CreateUserDto): Promise<UserEntity> {
    const createdUser = new this.userModel(user);
    const savedUser = await createdUser.save();

    return UserMapper.toEntity(savedUser);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ email });
    return user ? UserMapper.toEntity(user) : null;
  }
}
