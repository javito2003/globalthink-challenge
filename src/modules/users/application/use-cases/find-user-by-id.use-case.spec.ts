import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { FindUserByIdUseCase } from './find-user-by-id.use-case';
import {
  USER_REPOSITORY_TOKEN,
  PROFILE_REPOSITORY_TOKEN,
} from '../../domain/repositories/repository.tokens';
import { UserNotFound } from '../../domain/exceptions/email-already-in-use.exception';
import {
  createMockUserRepository,
  createMockProfileRepository,
} from 'src/modules/shared/test/mocks';
import {
  createMockUser,
  createMockProfile,
} from 'src/modules/shared/test/factories';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import type { IProfileRepository } from '../../domain/repositories/profile.repository.interface';

describe('FindUserByIdUseCase', () => {
  let useCase: FindUserByIdUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let profileRepository: jest.Mocked<IProfileRepository>;

  const mockUser = createMockUser();
  const mockProfile = createMockProfile({ userId: mockUser.id });

  beforeEach(async () => {
    userRepository = createMockUserRepository();
    profileRepository = createMockProfileRepository();

    const module = await Test.createTestingModule({
      providers: [
        FindUserByIdUseCase,
        { provide: USER_REPOSITORY_TOKEN, useValue: userRepository },
        { provide: PROFILE_REPOSITORY_TOKEN, useValue: profileRepository },
      ],
    }).compile();

    useCase = module.get(FindUserByIdUseCase);
  });

  it('should return user with profile', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    profileRepository.findByUserId.mockResolvedValue(mockProfile);

    const result = await useCase.execute(mockUser.id);

    expect(result).toEqual({ ...mockUser, profile: mockProfile });
    expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
    expect(profileRepository.findByUserId).toHaveBeenCalledWith(mockUser.id);
  });

  it('should throw UserNotFound when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(faker.string.uuid())).rejects.toThrow(
      UserNotFound,
    );

    expect(profileRepository.findByUserId).not.toHaveBeenCalled();
  });
});
