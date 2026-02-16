import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { UpdateUserProfileByIdUseCase } from './update-user-profile-by-id.use-case';
import {
  PROFILE_REPOSITORY_TOKEN,
  USER_REPOSITORY_TOKEN,
} from '../../domain/repositories/repository.tokens';
import { UserNotFound } from '../../domain/exceptions/email-already-in-use.exception';
import { UserNotAllowedToEdit } from '../../domain/exceptions/user-not-allowed-to-edit.exception';
import {
  createMockProfileRepository,
  createMockUserRepository,
} from 'src/modules/shared/test/mocks';
import {
  createMockProfile,
  createMockUser,
} from 'src/modules/shared/test/factories';
import type { IProfileRepository } from '../../domain/repositories/profile.repository.interface';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

describe('UpdateUserProfileByIdUseCase', () => {
  let useCase: UpdateUserProfileByIdUseCase;
  let profileRepository: jest.Mocked<IProfileRepository>;
  let userRepository: jest.Mocked<IUserRepository>;

  const user = createMockUser();
  const mockProfile = createMockProfile({
    userId: user.id,
  });

  const updatedProfile = {
    ...mockProfile,
    firstName: faker.person.firstName(),
    bio: faker.lorem.sentence(),
  };

  beforeEach(async () => {
    profileRepository = createMockProfileRepository();
    userRepository = createMockUserRepository();

    const module = await Test.createTestingModule({
      providers: [
        UpdateUserProfileByIdUseCase,
        { provide: PROFILE_REPOSITORY_TOKEN, useValue: profileRepository },
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: userRepository,
        },
      ],
    }).compile();

    useCase = module.get(UpdateUserProfileByIdUseCase);
  });

  it('should update profile when user is the owner', async () => {
    profileRepository.findByUserId.mockResolvedValue(mockProfile);
    profileRepository.updateById.mockResolvedValue(updatedProfile);
    userRepository.findById.mockResolvedValue(user);

    const input = {
      firstName: updatedProfile.firstName,
      bio: updatedProfile.bio,
    };
    const result = await useCase.execute(
      mockProfile.userId,
      mockProfile.userId,
      input,
    );

    expect(result).toEqual({
      ...user,
      profile: updatedProfile,
    });
    expect(profileRepository.findByUserId).toHaveBeenCalledWith(
      mockProfile.userId,
    );
    expect(profileRepository.updateById).toHaveBeenCalledWith(
      mockProfile.userId,
      input,
    );
    expect(userRepository.findById).toHaveBeenCalledWith(mockProfile.userId);
  });

  it('should throw UserNotFound when profile does not exist', async () => {
    profileRepository.findByUserId.mockResolvedValue(null);

    const userId = faker.string.uuid();

    await expect(
      useCase.execute(userId, userId, {
        firstName: faker.person.firstName(),
      }),
    ).rejects.toThrow(UserNotFound);

    expect(profileRepository.updateById).not.toHaveBeenCalled();
  });

  it('should throw UserNotAllowedToEdit when user is not the owner', async () => {
    profileRepository.findByUserId.mockResolvedValue(mockProfile);

    await expect(
      useCase.execute(mockProfile.userId, faker.string.uuid(), {
        firstName: faker.person.firstName(),
      }),
    ).rejects.toThrow(UserNotAllowedToEdit);

    expect(profileRepository.updateById).not.toHaveBeenCalled();
  });
});
