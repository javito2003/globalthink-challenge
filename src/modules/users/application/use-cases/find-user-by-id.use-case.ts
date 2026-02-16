import { Inject, Injectable } from '@nestjs/common';
import {
  PROFILE_REPOSITORY_TOKEN,
  USER_REPOSITORY_TOKEN,
} from '../../domain/repositories/repository.tokens';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserNotFound } from '../../domain/exceptions/email-already-in-use.exception';
import type { IProfileRepository } from '../../domain/repositories/profile.repository.interface';

@Injectable()
export class FindUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFound();
    }
    const profile = await this.profileRepository.findByUserId(userId);

    return { ...user, profile };
  }
}
