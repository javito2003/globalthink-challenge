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
import { SortDirection } from 'src/modules/shared/domain/enums/sort-direction.enum';

describe('FindUsersUseCase', () => {
  let useCase: FindUsersUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let profileRepository: jest.Mocked<IProfileRepository>;

  const mockUsers = [createMockUser(), createMockUser()];
  const mockProfiles = [
    createMockProfile({ userId: mockUsers[0].id }),
    createMockProfile({ userId: mockUsers[1].id }),
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

  it('should return users with profiles merged and total count', async () => {
    profileRepository.findWithCount.mockResolvedValue({
      profiles: mockProfiles,
      count: 2,
    });
    userRepository.findByIds.mockResolvedValue(mockUsers);

    const result = await useCase.execute({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortDir: SortDirection.DESC,
    });

    expect(result.total).toBe(2);
    expect(result.users).toHaveLength(2);
    expect(result.users[0].profile).toEqual(mockProfiles[0]);
    expect(result.users[1].profile).toEqual(mockProfiles[1]);
    expect(profileRepository.findWithCount).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortDir: SortDirection.DESC,
      search: undefined,
    });
    expect(userRepository.findByIds).toHaveBeenCalledWith([
      mockUsers[0].id,
      mockUsers[1].id,
    ]);
  });

  it('should return empty array when no profiles exist', async () => {
    profileRepository.findWithCount.mockResolvedValue({
      profiles: [],
      count: 0,
    });

    const result = await useCase.execute({
      page: 1,
      limit: 10,
    });

    expect(result.total).toBe(0);
    expect(result.users).toEqual([]);
    expect(userRepository.findByIds).not.toHaveBeenCalled();
  });

  it('should work without sorting when sortBy and sortDir are not provided', async () => {
    profileRepository.findWithCount.mockResolvedValue({
      profiles: mockProfiles,
      count: 2,
    });
    userRepository.findByIds.mockResolvedValue(mockUsers);

    const result = await useCase.execute({
      page: 1,
      limit: 10,
    });

    expect(result.total).toBe(2);
    expect(result.users).toHaveLength(2);
    expect(profileRepository.findWithCount).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      sortBy: undefined,
      sortDir: undefined,
      search: undefined,
    });
  });

  it('should pass search parameter to profile repository', async () => {
    profileRepository.findWithCount.mockResolvedValue({
      profiles: [mockProfiles[0]],
      count: 1,
    });
    userRepository.findByIds.mockResolvedValue([mockUsers[0]]);

    const result = await useCase.execute({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortDir: SortDirection.DESC,
      search: 'john',
    });

    expect(result.total).toBe(1);
    expect(result.users).toHaveLength(1);
    expect(profileRepository.findWithCount).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortDir: SortDirection.DESC,
      search: 'john',
    });
  });

  it('should handle pagination parameters correctly', async () => {
    profileRepository.findWithCount.mockResolvedValue({
      profiles: [mockProfiles[0]],
      count: 10,
    });
    userRepository.findByIds.mockResolvedValue([mockUsers[0]]);

    await useCase.execute({
      page: 2,
      limit: 5,
      sortBy: 'createdAt',
      sortDir: SortDirection.ASC,
    });

    expect(profileRepository.findWithCount).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
      sortBy: 'createdAt',
      sortDir: SortDirection.ASC,
      search: undefined,
    });
  });

  it('should maintain profile order in final result', async () => {
    const [profile1, profile2] = mockProfiles;
    profileRepository.findWithCount.mockResolvedValue({
      profiles: [profile2, profile1], // Reversed order
      count: 2,
    });
    userRepository.findByIds.mockResolvedValue(mockUsers); // May be in different order

    const result = await useCase.execute({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortDir: SortDirection.DESC,
    });

    // Verify the order matches profile order, not user order
    expect(result.users[0].profile).toEqual(profile2);
    expect(result.users[1].profile).toEqual(profile1);
  });
});
