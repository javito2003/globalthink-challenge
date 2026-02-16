import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvalidAccessTokenException } from '../../../auth/domain/exceptions';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-access') {
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
      throw new InvalidAccessTokenException();
    }
    return super.handleRequest(err, user, info, context);
  }
}
