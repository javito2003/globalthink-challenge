import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { UserMapper } from '../mappers/user.mapper';
import { User as UserEntity } from '../../../domain/entities/user.entity';
import {
  IUserRepository,
  CreateUserDto,
} from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
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

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById(id);
    return user ? UserMapper.toEntity(user) : null;
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken });
  }
}
