import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IPasswordHasherService } from '../../domain/services/password-hasher.service.interface';

export const BCRYPT_SERVICE_NAME = 'BcryptPasswordHasher';

@Injectable()
export class BcryptPasswordHasher implements IPasswordHasherService {
  private readonly SALT_ROUNDS = 10;

  hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
