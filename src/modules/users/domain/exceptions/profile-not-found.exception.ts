import { DomainException } from 'src/modules/shared/domain/exceptions/domain.exception';
import { PROFILE_EXCEPTIONS } from './profile.exceptions';

export class ProfileNotFound extends DomainException {
  constructor() {
    super(
      PROFILE_EXCEPTIONS.PROFILE_NOT_FOUND.message,
      PROFILE_EXCEPTIONS.PROFILE_NOT_FOUND.statusCode,
      PROFILE_EXCEPTIONS.PROFILE_NOT_FOUND.code,
    );
  }
}
