import { DomainException } from '../../../shared/domain/exceptions/domain.exception';
import { AUTH_EXCEPTIONS } from '../auth.exceptions';

export class InvalidRefreshTokenException extends DomainException {
  constructor() {
    super(
      AUTH_EXCEPTIONS.INVALID_REFRESH_TOKEN.message,
      AUTH_EXCEPTIONS.INVALID_REFRESH_TOKEN.statusCode,
    );
  }
}
