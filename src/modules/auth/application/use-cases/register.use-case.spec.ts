import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { RegisterUseCase } from './register.use-case';
import {
  USER_REPOSITORY_TOKEN,
  PROFILE_REPOSITORY_TOKEN,
} from 'src/modules/users/domain/repositories/repository.tokens';
import { BCRYPT_SERVICE_NAME } from '../../infrastructure/services/bcrypt-hasher.service';
import { TOKEN_SERVICE_NAME } from '../../infrastructure/services/jwt-token.service';
import { EmailAlreadyInUseException } from '../../domain/exceptions/email-already-in-use.exception';
import {
  createMockUserRepository,
  createMockProfileRepository,
  createMockPasswordHasher,
  createMockTokenService,
} from 'src/modules/shared/test/mocks';
import {
  createMockUser,
  createMockTokenPair,
} from 'src/modules/shared/test/factories';
import type { IUserRepository } from 'src/modules/users/domain/repositories/user.repository.interface';
import type { IProfileRepository } from 'src/modules/users/domain/repositories/profile.repository.interface';
import type { IPasswordHasherService } from '../../domain/services/password-hasher.service.interface';
import type { ITokenService } from '../../domain/services/token.service.interface';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let profileRepository: jest.Mocked<IProfileRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasherService>;
  let tokenService: jest.Mocked<ITokenService>;

  const registerInput = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    birthDate: new Date('1990-01-01'),
  };

  const createdUser = createMockUser({ email: registerInput.email });
  const mockTokenPair = createMockTokenPair();

  beforeEach(async () => {
    userRepository = createMockUserRepository();
    profileRepository = createMockProfileRepository();
    passwordHasher = createMockPasswordHasher();
    tokenService = createMockTokenService();

    const module = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        { provide: USER_REPOSITORY_TOKEN, useValue: userRepository },
        { provide: PROFILE_REPOSITORY_TOKEN, useValue: profileRepository },
        { provide: BCRYPT_SERVICE_NAME, useValue: passwordHasher },
        { provide: TOKEN_SERVICE_NAME, useValue: tokenService },
      ],
    }).compile();

    useCase = module.get(RegisterUseCase);
  });

  it('should create user and profile and return token pair', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue('hashed-password');
    userRepository.create.mockResolvedValue(createdUser);
    tokenService.generateTokenPair.mockResolvedValue(mockTokenPair);

    const result = await useCase.execute(registerInput);

    expect(result).toEqual(mockTokenPair);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      registerInput.email,
    );
    expect(passwordHasher.hash).toHaveBeenCalledWith(registerInput.password);
    expect(userRepository.create).toHaveBeenCalledWith({
      email: registerInput.email,
      password: 'hashed-password',
    });
    expect(profileRepository.create).toHaveBeenCalledWith({
      userId: createdUser.id,
      firstName: registerInput.firstName,
      lastName: registerInput.lastName,
      birthDate: registerInput.birthDate,
    });
    expect(tokenService.generateTokenPair).toHaveBeenCalledWith({
      sub: createdUser.id,
      email: registerInput.email,
    });
  });

  it('should throw EmailAlreadyInUseException when email exists', async () => {
    userRepository.findByEmail.mockResolvedValue(createdUser);

    await expect(useCase.execute(registerInput)).rejects.toThrow(
      EmailAlreadyInUseException,
    );

    expect(userRepository.create).not.toHaveBeenCalled();
    expect(profileRepository.create).not.toHaveBeenCalled();
  });
});
