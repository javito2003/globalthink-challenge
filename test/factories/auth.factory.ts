import { faker } from '@faker-js/faker';
import type { RegisterDto } from '../../src/modules/auth/presentation/dto/register.dto';
import type { LoginDto } from '../../src/modules/auth/presentation/dto/login.dto';

export const createRegisterPayload = (
  overrides?: Partial<RegisterDto>,
): RegisterDto => ({
  email: faker.internet.email(),
  password: faker.internet.password({ length: 10 }),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  birthDate: faker.date.birthdate().toISOString().split('T')[0],
  ...overrides,
});

export const createLoginPayload = (
  overrides?: Partial<LoginDto>,
): LoginDto => ({
  email: faker.internet.email(),
  password: faker.internet.password({ length: 10 }),
  ...overrides,
});
