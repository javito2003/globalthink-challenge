import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomConfigService } from '../../../shared/infrastructure/services/custom-config.service';
import {
  ITokenService,
  ITokenPayload,
  ITokenPair,
} from '../../domain/services/token.service.interface';
import {
  ACCESS_TOKEN_EXPIRATION_MINUTES,
  REFRESH_TOKEN_EXPIRATION_DAYS,
} from '../../domain/constants/auth.constants';

export const TOKEN_SERVICE_NAME = 'ITokenService';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: CustomConfigService,
  ) {}

  async generateTokenPair(payload: ITokenPayload): Promise<ITokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.jwt.accessSecret,
        expiresIn: ACCESS_TOKEN_EXPIRATION_MINUTES * 60,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.jwt.refreshSecret,
        expiresIn: REFRESH_TOKEN_EXPIRATION_DAYS * 24 * 60 * 60,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<ITokenPayload> {
    return this.jwtService.verifyAsync<ITokenPayload>(token, {
      secret: this.configService.jwt.accessSecret,
    });
  }

  async verifyRefreshToken(token: string): Promise<ITokenPayload> {
    return this.jwtService.verifyAsync<ITokenPayload>(token, {
      secret: this.configService.jwt.refreshSecret,
    });
  }
}
