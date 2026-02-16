import { Inject, Injectable } from '@nestjs/common';
import { BCRYPT_SERVICE_NAME } from '../../infrastructure/services/bcrypt-hasher.service';
import type { IPasswordHasherService } from '../../domain/services/password-hasher.service.interface';
import { TOKEN_SERVICE_NAME } from '../../infrastructure/services/jwt-token.service';
import { TOKEN_HASHER_SERVICE_NAME } from '../../infrastructure/services/sha256-token-hasher.service';
import type { ITokenService } from '../../domain/services/token.service.inteface';
import { ITokenPair } from '../../domain/services/token.service.interface';
import type { ITokenHasherService } from '../../domain/services/token-hasher.service.interface';
import { EmailAlreadyInUseException } from '../../domain/exceptions/email-already-in-use.exception';
import {
  PROFILE_REPOSITORY_TOKEN,
  USER_REPOSITORY_TOKEN,
} from 'src/modules/users/domain/repositories/repository.tokens';
import type { IUserRepository } from 'src/modules/users/domain/repositories/user.repository.interface';
import type { IProfileRepository } from 'src/modules/users/domain/repositories/profile.repository.interface';

export interface RegisterUseCaseInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
    @Inject(BCRYPT_SERVICE_NAME)
    private readonly passwordHasherService: IPasswordHasherService,
    @Inject(TOKEN_SERVICE_NAME)
    private readonly tokenService: ITokenService,
    @Inject(TOKEN_HASHER_SERVICE_NAME)
    private readonly tokenHasherService: ITokenHasherService,
  ) {}

  async execute(input: RegisterUseCaseInput): Promise<ITokenPair> {
    const existentUser = await this.userRepository.findByEmail(input.email);
    if (existentUser) {
      throw new EmailAlreadyInUseException();
    }

    const hashedPassword = await this.passwordHasherService.hash(
      input.password,
    );

    const createdUser = await this.userRepository.create({
      email: input.email,
      password: hashedPassword,
    });

    await this.profileRepository.create({
      userId: createdUser.id,
      firstName: input.firstName,
      lastName: input.lastName,
      birthDate: input.birthDate,
    });

    // Generate token pair
    const tokens = await this.tokenService.generateTokenPair({
      sub: createdUser.id,
      email: createdUser.email,
    });

    // Hash and save refresh token
    const hashedRefreshToken = await this.passwordHasherService.hash(
      this.tokenHasherService.hash(tokens.refreshToken),
    );
    await this.userRepository.updateRefreshToken(
      createdUser.id,
      hashedRefreshToken,
    );

    return tokens;
  }
}
