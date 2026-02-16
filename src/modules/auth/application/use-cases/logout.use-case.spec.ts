import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { LogoutUseCase } from './logout.use-case';
import { USER_REPOSITORY_TOKEN } from 'src/modules/users/domain/repositories/repository.tokens';
import { createMockUserRepository } from 'src/modules/shared/test/mocks';
import type { IUserRepository } from 'src/modules/users/domain/repositories/user.repository.interface';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    userRepository = createMockUserRepository();

    const module = await Test.createTestingModule({
      providers: [
        LogoutUseCase,
        { provide: USER_REPOSITORY_TOKEN, useValue: userRepository },
      ],
    }).compile();

    useCase = module.get(LogoutUseCase);
  });

  it('should set refresh token to null', async () => {
    const userId = faker.string.uuid();
    await useCase.execute(userId);

    expect(userRepository.updateRefreshToken).toHaveBeenCalledWith(
      userId,
      null,
    );
  });
});
