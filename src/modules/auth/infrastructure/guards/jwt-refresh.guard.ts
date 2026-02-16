import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvalidRefreshTokenException } from '../../domain/exceptions';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser | false,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err) {
      throw err;
    }
    if (!user) {
      throw new InvalidRefreshTokenException();
    }
    return super.handleRequest(err, user, info, context);
  }
}
