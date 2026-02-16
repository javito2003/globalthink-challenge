import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { UpdateUserProfileByIdUseCase } from './update-user-profile-by-id.use-case';
import { PROFILE_REPOSITORY_TOKEN } from '../../domain/repositories/repository.tokens';
import { UserNotFound } from '../../domain/exceptions/email-already-in-use.exception';
import { UserNotAllowedToEdit } from '../../domain/exceptions/user-not-allowed-to-edit.exception';
import { createMockProfileRepository } from 'src/modules/shared/test/mocks';
import { createMockProfile } from 'src/modules/shared/test/factories';
import type { IProfileRepository } from '../../domain/repositories/profile.repository.interface';

describe('UpdateUserProfileByIdUseCase', () => {
  let useCase: UpdateUserProfileByIdUseCase;
  let profileRepository: jest.Mocked<IProfileRepository>;

  const mockProfile = createMockProfile();

  const updatedProfile = {
    ...mockProfile,
    firstName: faker.person.firstName(),
    bio: faker.lorem.sentence(),
  };

  beforeEach(async () => {
    profileRepository = createMockProfileRepository();

    const module = await Test.createTestingModule({
      providers: [
        UpdateUserProfileByIdUseCase,
        { provide: PROFILE_REPOSITORY_TOKEN, useValue: profileRepository },
      ],
    }).compile();

    useCase = module.get(UpdateUserProfileByIdUseCase);
  });

  it('should update profile when user is the owner', async () => {
    profileRepository.findByUserId.mockResolvedValue(mockProfile);
    profileRepository.updateById.mockResolvedValue(updatedProfile);

    const input = { firstName: updatedProfile.firstName, bio: updatedProfile.bio };
    const result = await useCase.execute(
      mockProfile.userId,
      mockProfile.userId,
      input,
    );

    expect(result).toEqual(updatedProfile);
    expect(profileRepository.findByUserId).toHaveBeenCalledWith(
      mockProfile.userId,
    );
    expect(profileRepository.updateById).toHaveBeenCalledWith(
      mockProfile.userId,
      input,
    );
  });

  it('should throw UserNotFound when profile does not exist', async () => {
    profileRepository.findByUserId.mockResolvedValue(null);

    await expect(
      useCase.execute('unknown-id', 'unknown-id', {
        firstName: faker.person.firstName(),
      }),
    ).rejects.toThrow(UserNotFound);

    expect(profileRepository.updateById).not.toHaveBeenCalled();
  });

  it('should throw UserNotAllowedToEdit when user is not the owner', async () => {
    profileRepository.findByUserId.mockResolvedValue(mockProfile);

    await expect(
      useCase.execute(mockProfile.userId, 'other-user', {
        firstName: faker.person.firstName(),
      }),
    ).rejects.toThrow(UserNotAllowedToEdit);

    expect(profileRepository.updateById).not.toHaveBeenCalled();
  });
});
