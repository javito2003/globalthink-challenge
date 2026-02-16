import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from 'src/modules/users/domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from 'src/modules/users/domain/repositories/repository.tokens';
import { BCRYPT_SERVICE_NAME } from '../../infrastructure/services/bcrypt-hasher.service';
import { TOKEN_SERVICE_NAME } from '../../infrastructure/services/jwt-token.service';
import { TOKEN_HASHER_SERVICE_NAME } from '../../infrastructure/services/sha256-token-hasher.service';
import type { IPasswordHasherService } from '../../domain/services/password-hasher.service.interface';
import type {
  ITokenService,
  ITokenPair,
} from '../../domain/services/token.service.interface';
import type { ITokenHasherService } from '../../domain/services/token-hasher.service.interface';
import { InvalidRefreshTokenException } from '../../domain/exceptions/invalid-refresh-token.exception';

@Injectable()
export class RefreshTokenUseCase {
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

  async execute(userId: string, refreshToken: string): Promise<ITokenPair> {
    const user = await this.userRepository.findById(userId);

    if (!user || !user.refreshToken) {
      throw new InvalidRefreshTokenException();
    }

    // Compare the provided refresh token with the stored hashed one
    const isRefreshTokenValid = await this.passwordHasherService.compare(
      this.tokenHasherService.hash(refreshToken),
      user.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new InvalidRefreshTokenException();
    }

    // Generate new token pair
    const tokens = await this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
    });

    // Hash and update the new refresh token
    const hashedRefreshToken = await this.passwordHasherService.hash(
      this.tokenHasherService.hash(tokens.refreshToken),
    );
    await this.userRepository.updateRefreshToken(user.id, hashedRefreshToken);

    return tokens;
  }
}
