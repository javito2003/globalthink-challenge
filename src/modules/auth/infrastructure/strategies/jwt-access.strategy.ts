import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomConfigService } from '../../../shared/infrastructure/services/custom-config.service';
import { ITokenPayload } from '../../domain/services/token.service.interface';
import { InvalidAccessTokenException } from '../../domain/exceptions';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(private readonly configService: CustomConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwt.accessSecret,
    });
  }

  validate(payload: ITokenPayload): ITokenPayload {
    if (!payload || !payload.sub || !payload.email) {
      throw new InvalidAccessTokenException();
    }
    return { sub: payload.sub, email: payload.email };
  }
}
