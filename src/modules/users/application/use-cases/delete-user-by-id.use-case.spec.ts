import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { DeleteUserByIdUseCase } from './delete-user-by-id.use-case';
import {
  USER_REPOSITORY_TOKEN,
  PROFILE_REPOSITORY_TOKEN,
} from '../../domain/repositories/repository.tokens';
import { UserNotFound } from '../../domain/exceptions/email-already-in-use.exception';
import { UserNotAllowedToDelete } from '../../domain/exceptions/user-not-allowed-to-delete.exception';
import {
  createMockUserRepository,
  createMockProfileRepository,
} from 'src/modules/shared/test/mocks';
import { createMockUser } from 'src/modules/shared/test/factories';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import type { IProfileRepository } from '../../domain/repositories/profile.repository.interface';

describe('DeleteUserByIdUseCase', () => {
  let useCase: DeleteUserByIdUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let profileRepository: jest.Mocked<IProfileRepository>;

  const mockUser = createMockUser();

  beforeEach(async () => {
    userRepository = createMockUserRepository();
    profileRepository = createMockProfileRepository();

    const module = await Test.createTestingModule({
      providers: [
        DeleteUserByIdUseCase,
        { provide: USER_REPOSITORY_TOKEN, useValue: userRepository },
        { provide: PROFILE_REPOSITORY_TOKEN, useValue: profileRepository },
      ],
    }).compile();

    useCase = module.get(DeleteUserByIdUseCase);
  });

  it('should delete user and profile when user is the owner', async () => {
    userRepository.findById.mockResolvedValue(mockUser);

    await useCase.execute(mockUser.id, mockUser.id);

    expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
    expect(profileRepository.deleteByUserId).toHaveBeenCalledWith(mockUser.id);
    expect(userRepository.deleteById).toHaveBeenCalledWith(mockUser.id);
  });

  it('should throw UserNotFound when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);
    const userId = faker.string.uuid();

    await expect(useCase.execute(userId, userId)).rejects.toThrow(UserNotFound);

    expect(profileRepository.deleteByUserId).not.toHaveBeenCalled();
    expect(userRepository.deleteById).not.toHaveBeenCalled();
  });

  it('should throw UserNotAllowedToDelete when user is not the owner', async () => {
    userRepository.findById.mockResolvedValue(mockUser);

    await expect(
      useCase.execute(mockUser.id, faker.string.uuid()),
    ).rejects.toThrow(UserNotAllowedToDelete);

    expect(profileRepository.deleteByUserId).not.toHaveBeenCalled();
    expect(userRepository.deleteById).not.toHaveBeenCalled();
  });
});
