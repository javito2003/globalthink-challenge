import { Inject, Injectable } from '@nestjs/common';
import {
  PROFILE_REPOSITORY_TOKEN,
  USER_REPOSITORY_TOKEN,
} from '../../domain/repositories/repository.tokens';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import type { IProfileRepository } from '../../domain/repositories/profile.repository.interface';
import type { User } from '../../domain/entities/user.entity';

@Injectable()
export class FindUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(): Promise<{ users: User[]; count: number }> {
    const { users, count } = await this.userRepository.findWithCount();
    const userIds = users.map((user) => user.id);

    const profiles = await this.profileRepository.findByUserIds(userIds);

    const usersWithProfiles = users.map((user) => {
      const profile = profiles.find((p) => p.userId === user.id);
      return {
        ...user,
        profile: profile ?? null,
      };
    });

    return { users: usersWithProfiles, count };
  }
}
