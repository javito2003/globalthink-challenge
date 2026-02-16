import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from 'src/modules/users/domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from 'src/modules/users/domain/repositories/repository.tokens';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, null);
  }
}
