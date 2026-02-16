import { Inject, Injectable } from '@nestjs/common';
import { BCRYPT_SERVICE_NAME } from '../../infrastructure/services/bcrypt-hasher.service';
import { TOKEN_SERVICE_NAME } from '../../infrastructure/services/jwt-token.service';
import { TOKEN_HASHER_SERVICE_NAME } from '../../infrastructure/services/sha256-token-hasher.service';
import type { IPasswordHasherService } from '../../domain/services/password-hasher.service.interface';
import type {
  ITokenService,
  ITokenPair,
} from '../../domain/services/token.service.interface';
import type { ITokenHasherService } from '../../domain/services/token-hasher.service.interface';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import type { IUserRepository } from 'src/modules/users/domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from 'src/modules/users/domain/repositories/repository.tokens';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(BCRYPT_SERVICE_NAME)
    private readonly passwordHasherService: IPasswordHasherService,
    @Inject(TOKEN_SERVICE_NAME)
    private readonly tokenService: ITokenService,
    @Inject(TOKEN_HASHER_SERVICE_NAME)
    private readonly tokenHasherService: ITokenHasherService,
  ) {}

  async execute(email: string, password: string): Promise<ITokenPair> {
    const existentUser = await this.userRepository.findByEmail(email);
    if (!existentUser) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await this.passwordHasherService.compare(
      password,
      existentUser.password,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // Generate token pair
    const tokens = await this.tokenService.generateTokenPair({
      sub: existentUser.id,
      email: existentUser.email,
    });

    // Hash and save refresh token
    const hashedRefreshToken = await this.passwordHasherService.hash(
      this.tokenHasherService.hash(tokens.refreshToken),
    );
    await this.userRepository.updateRefreshToken(
      existentUser.id,
      hashedRefreshToken,
    );

    return tokens;
  }
}
