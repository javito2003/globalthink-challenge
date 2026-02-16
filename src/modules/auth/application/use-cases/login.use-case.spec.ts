import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { LoginUseCase } from './login.use-case';
import { USER_REPOSITORY_TOKEN } from 'src/modules/users/domain/repositories/repository.tokens';
import { BCRYPT_SERVICE_NAME } from '../../infrastructure/services/bcrypt-hasher.service';
import { TOKEN_SERVICE_NAME } from '../../infrastructure/services/jwt-token.service';
import { TOKEN_HASHER_SERVICE_NAME } from '../../infrastructure/services/sha256-token-hasher.service';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import {
  createMockUserRepository,
  createMockPasswordHasher,
  createMockTokenService,
  createMockTokenHasher,
} from 'src/modules/shared/test/mocks';
import {
  createMockUser,
  createMockTokenPair,
} from 'src/modules/shared/test/factories';
import type { IUserRepository } from 'src/modules/users/domain/repositories/user.repository.interface';
import type { IPasswordHasherService } from '../../domain/services/password-hasher.service.interface';
import type { ITokenService } from '../../domain/services/token.service.interface';
import type { ITokenHasherService } from '../../domain/services/token-hasher.service.interface';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasherService>;
  let tokenService: jest.Mocked<ITokenService>;
  let tokenHasher: jest.Mocked<ITokenHasherService>;

  const mockUser = createMockUser();
  const mockTokenPair = createMockTokenPair();

  beforeEach(async () => {
    userRepository = createMockUserRepository();
    passwordHasher = createMockPasswordHasher();
    tokenService = createMockTokenService();
    tokenHasher = createMockTokenHasher();

    const module = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: USER_REPOSITORY_TOKEN, useValue: userRepository },
        { provide: BCRYPT_SERVICE_NAME, useValue: passwordHasher },
        { provide: TOKEN_SERVICE_NAME, useValue: tokenService },
        { provide: TOKEN_HASHER_SERVICE_NAME, useValue: tokenHasher },
      ],
    }).compile();

    useCase = module.get(LoginUseCase);
  });

  it('should return token pair when credentials are valid', async () => {
    const hashedToken = faker.string.alphanumeric(64);
    const hashedRefreshToken = faker.string.alphanumeric(20);

    userRepository.findByEmail.mockResolvedValue(mockUser);
    passwordHasher.compare.mockResolvedValue(true);
    tokenHasher.hash.mockReturnValue(hashedToken);
    passwordHasher.hash.mockResolvedValue(hashedRefreshToken);
    tokenService.generateTokenPair.mockResolvedValue(mockTokenPair);

    const password = faker.string.alphanumeric(10);

    const result = await useCase.execute(mockUser.email, password);

    expect(result).toEqual(mockTokenPair);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
    expect(passwordHasher.compare).toHaveBeenCalledWith(
      password,
      mockUser.password,
    );
    expect(tokenService.generateTokenPair).toHaveBeenCalledWith({
      sub: mockUser.id,
      email: mockUser.email,
    });
    expect(tokenHasher.hash).toHaveBeenCalledWith(mockTokenPair.refreshToken);
    expect(passwordHasher.hash).toHaveBeenCalledWith(hashedToken);
    expect(userRepository.updateRefreshToken).toHaveBeenCalledWith(
      mockUser.id,
      hashedRefreshToken,
    );
  });

  it('should throw InvalidCredentialsException when user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute(faker.internet.email(), faker.string.alphanumeric(10)),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should throw InvalidCredentialsException when password is invalid', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);
    passwordHasher.compare.mockResolvedValue(false);

    await expect(
      useCase.execute(mockUser.email, faker.string.alphanumeric(10)),
    ).rejects.toThrow(InvalidCredentialsException);

    expect(tokenService.generateTokenPair).not.toHaveBeenCalled();
  });
});
