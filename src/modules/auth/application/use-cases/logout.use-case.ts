import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/modules/users/infrastructure/persistence/repositories/user.repository';

@Injectable()
export class LogoutUseCase {
  constructor(@Inject() private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, null);
  }
}
