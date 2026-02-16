import { Profile } from '../entities/profile.entity';

export class CreateProfileDto {
  userId: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  bio?: string;
}

export type UpdateProfileDto = Partial<
  Pick<Profile, 'bio' | 'firstName' | 'lastName' | 'birthDate'>
>;

export interface IProfileRepository {
  create(profile: CreateProfileDto): Promise<Profile>;
  updateById(userId: string, updateData: UpdateProfileDto): Promise<Profile>;
  findByUserId(userId: string): Promise<Profile | null>;
  findByUserIds(userIds: string[]): Promise<Profile[]>;
  deleteByUserId(userId: string): Promise<void>;
}
