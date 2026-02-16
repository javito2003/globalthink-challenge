import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { ITokenHasherService } from '../../domain/services/token-hasher.service.interface';

export const TOKEN_HASHER_SERVICE_NAME = 'Sha256TokenHasher';

@Injectable()
export class Sha256TokenHasher implements ITokenHasherService {
  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
