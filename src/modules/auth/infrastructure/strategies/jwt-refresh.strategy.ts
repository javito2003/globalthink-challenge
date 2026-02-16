import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomConfigService } from '../../../shared/infrastructure/services/custom-config.service';
import { Request } from 'express';
import { ITokenPayload } from '../../domain/services/token.service.interface';
import { InvalidRefreshTokenException } from '../../domain/exceptions';
import type { IUserValidatorService } from '../../domain/services/user-validator.service.interface';
import { USER_VALIDATOR_SERVICE_NAME } from '../services/user-validator.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: CustomConfigService,
    @Inject(USER_VALIDATOR_SERVICE_NAME)
    private readonly userValidator: IUserValidatorService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwt.refreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: ITokenPayload) {
    const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();

    if (!refreshToken) {
      throw new InvalidRefreshTokenException();
    }

    if (!payload || !payload.sub || !payload.email) {
      throw new InvalidRefreshTokenException();
    }

    // Check if user still exists and has a valid refresh token
    const isValid = await this.userValidator.validateUserRefreshToken(
      payload.sub,
      refreshToken,
    );
    if (!isValid) {
      throw new InvalidRefreshTokenException();
    }

    return { ...payload, refreshToken };
  }
}
