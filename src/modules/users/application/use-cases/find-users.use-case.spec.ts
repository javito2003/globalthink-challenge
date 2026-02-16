import { Test } from '@nestjs/testing';
import { FindUsersUseCase } from './find-users.use-case';
import {
  USER_REPOSITORY_TOKEN,
  PROFILE_REPOSITORY_TOKEN,
} from '../../domain/repositories/repository.tokens';
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

describe('FindUsersUseCase', () => {
  let useCase: FindUsersUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let profileRepository: jest.Mocked<IProfileRepository>;

  const mockUsers = [createMockUser(), createMockUser()];
  const mockProfiles = [
    createMockProfile({ userId: mockUsers[0].id }),
  ];

  beforeEach(async () => {
    userRepository = createMockUserRepository();
    profileRepository = createMockProfileRepository();

    const module = await Test.createTestingModule({
      providers: [
        FindUsersUseCase,
        { provide: USER_REPOSITORY_TOKEN, useValue: userRepository },
        { provide: PROFILE_REPOSITORY_TOKEN, useValue: profileRepository },
      ],
    }).compile();

    useCase = module.get(FindUsersUseCase);
  });

  it('should return users with profiles merged and count', async () => {
    userRepository.findWithCount.mockResolvedValue({
      users: mockUsers,
      count: 2,
    });
    profileRepository.findByUserIds.mockResolvedValue(mockProfiles);

    const result = await useCase.execute();

    expect(result.count).toBe(2);
    expect(result.users).toHaveLength(2);
    expect(result.users[0].profile).toEqual(mockProfiles[0]);
    expect(result.users[1].profile).toBeNull();
    expect(profileRepository.findByUserIds).toHaveBeenCalledWith([
      mockUsers[0].id,
      mockUsers[1].id,
    ]);
  });

  it('should return empty array when no users exist', async () => {
    userRepository.findWithCount.mockResolvedValue({ users: [], count: 0 });
    profileRepository.findByUserIds.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result.count).toBe(0);
    expect(result.users).toEqual([]);
  });
});
