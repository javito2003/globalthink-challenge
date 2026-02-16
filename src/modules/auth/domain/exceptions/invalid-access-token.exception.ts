import { DomainException } from '../../../shared/domain/exceptions/domain.exception';
import { AUTH_EXCEPTIONS } from './auth.exceptions';

export class InvalidAccessTokenException extends DomainException {
  constructor() {
    super(
      AUTH_EXCEPTIONS.INVALID_ACCESS_TOKEN.message,
      AUTH_EXCEPTIONS.INVALID_ACCESS_TOKEN.statusCode,
      AUTH_EXCEPTIONS.INVALID_ACCESS_TOKEN.code,
    );
  }
}
