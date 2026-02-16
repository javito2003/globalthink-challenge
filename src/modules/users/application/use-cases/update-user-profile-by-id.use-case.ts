import { Inject, Injectable } from '@nestjs/common';
import { PROFILE_REPOSITORY_TOKEN } from '../../domain/repositories/repository.tokens';
import type { IProfileRepository } from '../../domain/repositories/profile.repository.interface';
import { ProfileNotFound } from '../../domain/exceptions/profile-not-found.exception';
import { ProfileNotAllowedToEdit } from '../../domain/exceptions/profile-not-allowed-to-edit.exception';

export interface UpdateUserByIdUseCaseInput {
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  bio?: string;
}

@Injectable()
export class UpdateUserProfileByIdUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(
    userId: string,
    reqUserId: string,
    input: UpdateUserByIdUseCaseInput,
  ) {
    const userProfileFound = await this.profileRepository.findByUserId(userId);
    if (!userProfileFound) {
      throw new ProfileNotFound();
    }

    if (userId !== reqUserId) {
      throw new ProfileNotAllowedToEdit();
    }

    const userProfile = await this.profileRepository.updateById(userId, input);
    return userProfile;
  }
}
