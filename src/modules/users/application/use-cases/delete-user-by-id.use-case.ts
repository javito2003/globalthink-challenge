import { Inject, Injectable } from '@nestjs/common';
import {
  PROFILE_REPOSITORY_TOKEN,
  USER_REPOSITORY_TOKEN,
} from '../../domain/repositories/repository.tokens';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import type { IProfileRepository } from '../../domain/repositories/profile.repository.interface';
import { UserNotFound } from '../../domain/exceptions/email-already-in-use.exception';
import { UserNotAllowedToDelete } from '../../domain/exceptions/user-not-allowed-to-delete.exception';

@Injectable()
export class DeleteUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(userId: string, reqUserId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFound();
    }

    if (userId !== reqUserId) {
      throw new UserNotAllowedToDelete();
    }

    await Promise.all([
      this.profileRepository.deleteByUserId(userId),
      this.userRepository.deleteById(userId),
    ]);
  }
}
