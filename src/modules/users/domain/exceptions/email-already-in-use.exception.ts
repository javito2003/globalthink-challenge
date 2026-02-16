import { DomainException } from 'src/modules/shared/domain/exceptions/domain.exception';
import { USER_EXCEPTIONS } from './user.exceptions';

export class UserNotFound extends DomainException {
  constructor() {
    super(
      USER_EXCEPTIONS.USER_NOT_FOUND.message,
      USER_EXCEPTIONS.USER_NOT_FOUND.statusCode,
    );
  }
}
