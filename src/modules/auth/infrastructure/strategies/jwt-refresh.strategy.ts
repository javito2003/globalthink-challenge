import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomConfigService } from '../../../shared/infrastructure/services/custom-config.service';
import { Request } from 'express';
import { ITokenPayload } from '../../domain/services/token.service.interface';
import { InvalidRefreshTokenException } from '../../domain/exceptions';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: CustomConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwt.refreshSecret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: ITokenPayload) {
    const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();

    if (!refreshToken) {
      throw new InvalidRefreshTokenException();
    }

    if (!payload || !payload.sub || !payload.email) {
      throw new InvalidRefreshTokenException();
    }

    return { ...payload, refreshToken };
  }
}
