import { User } from '../entities/user.entity';
import { CreateUserDto } from '../../infrastructure/persistence/user.repository-types';

export interface IUserRepository {
  create(user: CreateUserDto): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
}
