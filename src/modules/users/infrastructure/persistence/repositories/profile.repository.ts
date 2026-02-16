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
import { SortDirection } from 'src/modules/shared/domain/enums/sort-direction.enum';
import { toMongoSortOrder } from 'src/modules/shared/infrastructure/utils/mongo-sort.util';

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

  async findWithCount(options: {
    page: number;
    limit: number;
    sortBy?: string;
    sortDir?: SortDirection;
    search?: string;
  }): Promise<{ profiles: ProfileEntity[]; count: number }> {
    const { page, limit, sortBy, sortDir, search } = options;

    // Build filter
    const filter = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build sort using utility
    const sort =
      sortBy && sortDir ? { [sortBy]: toMongoSortOrder(sortDir) } : {};

    // Execute queries in parallel
    const [profiles, count] = await Promise.all([
      this.profileModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.profileModel.countDocuments(filter).exec(),
    ]);

    return {
      profiles: profiles.map((profile) => ProfileMapper.toEntity(profile)),
      count,
    };
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.profileModel.deleteOne({ userId });
  }
}
