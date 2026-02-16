import { DomainException } from 'src/modules/shared/domain/exceptions/domain.exception';
import { USER_EXCEPTIONS } from './user.exceptions';

export class UserNotAllowedToDelete extends DomainException {
  constructor() {
    super(
      USER_EXCEPTIONS.USER_NOT_ALLOWED_TO_DELETE.message,
      USER_EXCEPTIONS.USER_NOT_ALLOWED_TO_DELETE.statusCode,
      USER_EXCEPTIONS.USER_NOT_ALLOWED_TO_DELETE.code,
    );
  }
}
