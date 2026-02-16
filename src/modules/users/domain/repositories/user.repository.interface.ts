import { User } from '../entities/user.entity';

export interface CreateUserDto {
  email: string;
  password: string;
}

export interface IUserRepository {
  create(user: CreateUserDto): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void>;
  findWithCount(): Promise<{ users: User[]; count: number }>;
  deleteById(userId: string): Promise<void>;
}
