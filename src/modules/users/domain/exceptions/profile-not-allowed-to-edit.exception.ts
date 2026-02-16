import { DomainException } from 'src/modules/shared/domain/exceptions/domain.exception';
import { PROFILE_EXCEPTIONS } from './profile.exceptions';

export class ProfileNotAllowedToEdit extends DomainException {
  constructor() {
    super(
      PROFILE_EXCEPTIONS.USER_NOT_ALLOWED_TO_EDIT_PROFILE.message,
      PROFILE_EXCEPTIONS.USER_NOT_ALLOWED_TO_EDIT_PROFILE.statusCode,
      PROFILE_EXCEPTIONS.USER_NOT_ALLOWED_TO_EDIT_PROFILE.code,
    );
  }
}
