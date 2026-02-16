import { DomainException } from 'src/modules/shared/domain/exceptions/domain.exception';
import { USER_EXCEPTIONS } from './user.exceptions';

export class UserNotAllowedToEdit extends DomainException {
  constructor() {
    super(
      USER_EXCEPTIONS.USER_NOT_ALLOWED_TO_EDIT_PROFILE.message,
      USER_EXCEPTIONS.USER_NOT_ALLOWED_TO_EDIT_PROFILE.statusCode,
      USER_EXCEPTIONS.USER_NOT_ALLOWED_TO_EDIT_PROFILE.code,
    );
  }
}
