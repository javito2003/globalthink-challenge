import { Inject, Injectable } from '@nestjs/common';
import type { IUserValidatorService } from '../../domain/services/user-validator.service.interface';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../users/domain/repositories/repository.tokens';

export const USER_VALIDATOR_SERVICE_NAME = 'UserValidatorService';

@Injectable()
export class UserValidatorService implements IUserValidatorService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async userExists(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    return !!user;
  }

  async validateUserRefreshToken(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    return !!user;
  }
}
