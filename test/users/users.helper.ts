import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createRegisterPayload } from '../factories/auth.factory';
import { ITokenPair } from 'src/modules/auth/domain/services/token.service.interface';
import { App } from 'supertest/types';
import { IUserRepository } from 'src/modules/users/domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from 'src/modules/users/domain/repositories/repository.tokens';

export class UsersHelper {
  static async setupUser(app: INestApplication<App>) {
    const userRepository = app.get<IUserRepository>(USER_REPOSITORY_TOKEN);

    const payload = createRegisterPayload();
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(201);

    const { accessToken, refreshToken } = response.body as ITokenPair;

    const user = await userRepository.findByEmail(payload.email);
    if (!user) {
      throw new Error(
        `User not found in database after registration. Payload: ${JSON.stringify(
          payload,
        )}`,
      );
    }

    return {
      accessToken,
      refreshToken,
      userId: user.id,
      ...payload,
    };
  }
}
