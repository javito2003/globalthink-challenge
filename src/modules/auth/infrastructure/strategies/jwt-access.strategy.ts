import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomConfigService } from '../../../shared/infrastructure/services/custom-config.service';
import { ITokenPayload } from '../../domain/services/token.service.interface';
import { InvalidAccessTokenException } from '../../domain/exceptions';
import type { IUserValidatorService } from '../../domain/services/user-validator.service.interface';
import { USER_VALIDATOR_SERVICE_NAME } from '../services/user-validator.service';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    private readonly configService: CustomConfigService,
    @Inject(USER_VALIDATOR_SERVICE_NAME)
    private readonly userValidator: IUserValidatorService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwt.accessSecret,
    });
  }

  async validate(payload: ITokenPayload): Promise<ITokenPayload> {
    if (!payload || !payload.sub || !payload.email) {
      throw new InvalidAccessTokenException();
    }

    // Check if user still exists in the database
    const userExists = await this.userValidator.userExists(payload.sub);
    if (!userExists) {
      throw new InvalidAccessTokenException();
    }

    return { sub: payload.sub, email: payload.email };
  }
}
