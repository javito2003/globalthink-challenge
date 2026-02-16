import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { USER_REPOSITORY_TOKEN } from 'src/modules/users/domain/repositories/repository.tokens';
import { BCRYPT_SERVICE_NAME } from '../../infrastructure/services/bcrypt-hasher.service';
import { TOKEN_SERVICE_NAME } from '../../infrastructure/services/jwt-token.service';
import { TOKEN_HASHER_SERVICE_NAME } from '../../infrastructure/services/sha256-token-hasher.service';
import { InvalidRefreshTokenException } from '../../domain/exceptions/invalid-refresh-token.exception';
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

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasherService>;
  let tokenService: jest.Mocked<ITokenService>;
  let tokenHasher: jest.Mocked<ITokenHasherService>;

  const mockUser = createMockUser({
    refreshToken: faker.string.alphanumeric(20),
  });
  const mockTokenPair = createMockTokenPair();

  beforeEach(async () => {
    userRepository = createMockUserRepository();
    passwordHasher = createMockPasswordHasher();
    tokenService = createMockTokenService();
    tokenHasher = createMockTokenHasher();

    const module = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        { provide: USER_REPOSITORY_TOKEN, useValue: userRepository },
        { provide: BCRYPT_SERVICE_NAME, useValue: passwordHasher },
        { provide: TOKEN_SERVICE_NAME, useValue: tokenService },
        { provide: TOKEN_HASHER_SERVICE_NAME, useValue: tokenHasher },
      ],
    }).compile();

    useCase = module.get(RefreshTokenUseCase);
  });

  it('should return new token pair when refresh token is valid', async () => {
    const hashedToken = faker.string.alphanumeric(64);
    const newHashedRefreshToken = faker.string.alphanumeric(20);

    userRepository.findById.mockResolvedValue(mockUser);
    tokenHasher.hash.mockReturnValue(hashedToken);
    passwordHasher.compare.mockResolvedValue(true);
    tokenService.generateTokenPair.mockResolvedValue(mockTokenPair);
    passwordHasher.hash.mockResolvedValue(newHashedRefreshToken);

    const validToken = faker.string.alphanumeric(20);

    const result = await useCase.execute(mockUser.id, validToken);

    expect(result).toEqual(mockTokenPair);
    expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
    expect(tokenHasher.hash).toHaveBeenCalledWith(validToken);
    expect(passwordHasher.compare).toHaveBeenCalledWith(
      hashedToken,
      mockUser.refreshToken,
    );
    expect(tokenService.generateTokenPair).toHaveBeenCalledWith({
      sub: mockUser.id,
      email: mockUser.email,
    });
    expect(tokenHasher.hash).toHaveBeenCalledWith(mockTokenPair.refreshToken);
    expect(passwordHasher.hash).toHaveBeenCalledWith(hashedToken);
    expect(userRepository.updateRefreshToken).toHaveBeenCalledWith(
      mockUser.id,
      newHashedRefreshToken,
    );
  });

  it('should throw InvalidRefreshTokenException when user is not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(faker.string.uuid(), faker.string.alphanumeric(20)),
    ).rejects.toThrow(InvalidRefreshTokenException);
  });

  it('should throw InvalidRefreshTokenException when user has no stored refresh token', async () => {
    userRepository.findById.mockResolvedValue({
      ...mockUser,
      refreshToken: null,
    });

    await expect(
      useCase.execute(mockUser.id, faker.string.alphanumeric(20)),
    ).rejects.toThrow(InvalidRefreshTokenException);
  });

  it('should throw InvalidRefreshTokenException when refresh token does not match', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    passwordHasher.compare.mockResolvedValue(false);

    await expect(
      useCase.execute(mockUser.id, faker.string.alphanumeric(20)),
    ).rejects.toThrow(InvalidRefreshTokenException);

    expect(tokenService.generateTokenPair).not.toHaveBeenCalled();
  });
});
