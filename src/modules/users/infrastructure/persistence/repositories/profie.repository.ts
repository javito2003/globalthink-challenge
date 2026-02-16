import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile as ProfileEntity } from '../../../domain/entities/profile.entity';
import { Profile } from '../schemas/profile.schema';
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
}
