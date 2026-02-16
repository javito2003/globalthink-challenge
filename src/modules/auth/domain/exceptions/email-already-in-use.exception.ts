import { DomainException } from 'src/modules/shared/domain/exceptions/domain.exception';

export class EmailAlreadyInUseException extends DomainException {
  constructor() {
    super('Email is already in use', 409);
  }
}
