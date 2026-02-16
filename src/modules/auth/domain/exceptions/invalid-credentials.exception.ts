import { DomainException } from '../../../shared/domain/exceptions/domain.exception';
import { AUTH_EXCEPTIONS } from './auth.exceptions';

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super(
      AUTH_EXCEPTIONS.INVALID_CREDENTIALS.message,
      AUTH_EXCEPTIONS.INVALID_CREDENTIALS.statusCode,
      AUTH_EXCEPTIONS.INVALID_CREDENTIALS.code,
    );
  }
}
