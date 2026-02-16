import { User } from '../entities/user.entity';

export interface CreateUserDto {
  email: string;
  password: string;
}

export interface IUserRepository {
  create(user: CreateUserDto): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
}
