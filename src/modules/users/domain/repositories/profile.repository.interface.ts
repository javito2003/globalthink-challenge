import { Profile } from '../entities/profile.entity';
import { SortDirection } from 'src/modules/shared/domain/enums/sort-direction.enum';

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
  findWithCount(options: {
    page: number;
    limit: number;
    sortBy?: string;
    sortDir?: SortDirection;
    search?: string;
  }): Promise<{ profiles: Profile[]; count: number }>;
  deleteByUserId(userId: string): Promise<void>;
}
