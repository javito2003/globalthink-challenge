import type { IUserRepository } from 'src/modules/users/domain/repositories/user.repository.interface';
import type { IProfileRepository } from 'src/modules/users/domain/repositories/profile.repository.interface';
import type { IPasswordHasherService } from 'src/modules/auth/domain/services/password-hasher.service.interface';
import type { ITokenService } from 'src/modules/auth/domain/services/token.service.interface';
import type { ITokenHasherService } from 'src/modules/auth/domain/services/token-hasher.service.interface';

export const createMockUserRepository = (): jest.Mocked<IUserRepository> => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findByIds: jest.fn(),
  create: jest.fn(),
  updateRefreshToken: jest.fn(),
  findWithCount: jest.fn(),
  deleteById: jest.fn(),
});

export const createMockProfileRepository =
  (): jest.Mocked<IProfileRepository> => ({
    create: jest.fn(),
    updateById: jest.fn(),
    findByUserId: jest.fn(),
    findByUserIds: jest.fn(),
    findWithCount: jest.fn(),
    deleteByUserId: jest.fn(),
  });

export const createMockPasswordHasher =
  (): jest.Mocked<IPasswordHasherService> => ({
    hash: jest.fn(),
    compare: jest.fn(),
  });

export const createMockTokenService = (): jest.Mocked<ITokenService> => ({
  generateTokenPair: jest.fn(),
  verifyAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
});

export const createMockTokenHasher = (): jest.Mocked<ITokenHasherService> => ({
  hash: jest.fn(),
});
