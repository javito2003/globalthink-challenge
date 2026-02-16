import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile as ProfileEntity } from '../../../domain/entities/profile.entity';
import { Profile, ProfileDocument } from '../schemas/profile.schema';
import {
  IProfileRepository,
  CreateProfileDto,
} from 'src/modules/users/domain/repositories/profile.repository.interface';
import { ProfileMapper } from '../mappers/profile.mapper';

@Injectable()
export class ProfileRepository implements IProfileRepository {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
  ) {}

  async create(profile: CreateProfileDto): Promise<ProfileEntity> {
    const profileCreated = new this.profileModel(profile);
    const savedProfile = await profileCreated.save();

    return ProfileMapper.toEntity(savedProfile);
  }

  async findByUserId(userId: string): Promise<ProfileEntity | null> {
    const profile = await this.profileModel.findOne({ userId });
    if (!profile) {
      return null;
    }
    return ProfileMapper.toEntity(profile);
  }

  async updateById(
    userId: string,
    updateData: Partial<CreateProfileDto>,
  ): Promise<ProfileEntity> {
    const updatedProfile = await this.profileModel.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true },
    );

    return ProfileMapper.toEntity(updatedProfile as ProfileDocument);
  }

  async findByUserIds(userIds: string[]): Promise<ProfileEntity[]> {
    const profiles = await this.profileModel.find({ userId: { $in: userIds } });
    return profiles.map((profile) => ProfileMapper.toEntity(profile));
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.profileModel.deleteOne({ userId });
  }
}
