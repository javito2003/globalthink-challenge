import { Inject, Injectable } from '@nestjs/common';
import {
  PROFILE_REPOSITORY_TOKEN,
  USER_REPOSITORY_TOKEN,
} from '../../domain/repositories/repository.tokens';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import type { IProfileRepository } from '../../domain/repositories/profile.repository.interface';
import type { User } from '../../domain/entities/user.entity';
import { SortDirection } from 'src/modules/shared/domain/enums/sort-direction.enum';

@Injectable()
export class FindUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(options: {
    page: number;
    limit: number;
    sortBy?: string;
    sortDir?: SortDirection;
    search?: string;
  }): Promise<{ users: User[]; total: number }> {
    const { page, limit, sortBy, sortDir, search } = options;

    // Find profiles with pagination and filtering
    const { profiles, count } = await this.profileRepository.findWithCount({
      page,
      limit,
      sortBy,
      sortDir,
      search,
    });

    // If no profiles found, return early
    if (!profiles.length) {
      return { users: [], total: 0 };
    }

    // Extract user IDs from profiles
    const userIds = profiles.map((profile) => profile.userId);

    // Find users by IDs
    const users = await this.userRepository.findByIds(userIds);

    // Merge users with profiles, maintaining profile order
    const usersWithProfiles = profiles.map((profile) => {
      const user = users.find((u) => u.id === profile.userId);
      return {
        ...user!,
        profile,
      };
    });

    return { users: usersWithProfiles, total: count };
  }
}
