import { faker } from '@faker-js/faker';
import type { User } from 'src/modules/users/domain/entities/user.entity';
import type { Profile } from 'src/modules/users/domain/entities/profile.entity';
import type { ITokenPair } from 'src/modules/auth/domain/services/token.service.interface';

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  password: faker.string.alphanumeric(10),
  refreshToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockProfile = (overrides?: Partial<Profile>): Profile => ({
  userId: faker.string.uuid(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  birthDate: faker.date.birthdate(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockTokenPair = (): ITokenPair => ({
  accessToken: faker.string.alphanumeric(20),
  refreshToken: faker.string.alphanumeric(20),
});
