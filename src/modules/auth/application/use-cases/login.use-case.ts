import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from 'src/modules/users/infrastructure/persistence/repositories/user.repository';
import { AUTH_EXCEPTIONS } from '../../domain/auth.exceptions';
import { BCRYPT_SERVICE_NAME } from '../../infrastructure/services/bcrypt-hasher.service';
import type { IPasswordHasherService } from '../../domain/services/password-hasher.service.interface';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject() private readonly userRepository: UserRepository,
    @Inject(BCRYPT_SERVICE_NAME)
    private readonly passwordHasherService: IPasswordHasherService,
  ) {}

  async execute(email: string, password: string) {
    const existentUser = await this.userRepository.findByEmail(email);
    if (!existentUser) {
      throw new UnauthorizedException(AUTH_EXCEPTIONS.INVALID_CREDENTIALS);
    }
    const isPasswordValid = await this.passwordHasherService.compare(
      password,
      existentUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_EXCEPTIONS.INVALID_CREDENTIALS);
    }
  }
}
