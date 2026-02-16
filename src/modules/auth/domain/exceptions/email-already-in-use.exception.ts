import { DomainException } from 'src/modules/shared/domain/exceptions/domain.exception';
import { AUTH_EXCEPTIONS } from './auth.exceptions';

export class EmailAlreadyInUseException extends DomainException {
  constructor() {
    super(
      AUTH_EXCEPTIONS.EMAIL_ALREADY_IN_USE.message,
      AUTH_EXCEPTIONS.EMAIL_ALREADY_IN_USE.statusCode,
      AUTH_EXCEPTIONS.EMAIL_ALREADY_IN_USE.code,
    );
  }
}
