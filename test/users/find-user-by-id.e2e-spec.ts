import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppHelper } from '../helpers/app.helper';
import { DatabaseHelper } from '../helpers/database.helper';
import { UsersHelper } from './users.helper';
import { App } from 'supertest/types';
import { UserResponseDto } from 'src/modules/users/presentation/dtos/user-response.dto';
import mongoose from 'mongoose';
import { ErrorResponseProperties } from 'src/modules/shared/presentation/api/build-error-response.properties';
import { USER_EXCEPTIONS } from 'src/modules/users/domain/exceptions/user.exceptions';

describe('Users - Find User By ID (e2e)', () => {
  let app: INestApplication<App>;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    const testApp = await AppHelper.createTestApp();
    app = testApp.app;
    mongoServer = testApp.mongoServer;
  });

  afterAll(async () => {
    await AppHelper.closeApp(app, mongoServer);
  });

  afterEach(async () => {
    await DatabaseHelper.cleanDatabase(app);
  });

  it('GET /users/:userId - Unauthorized', async () => {
    const user = await UsersHelper.setupUser(app);

    await request(app.getHttpServer()).get(`/users/${user.userId}`).expect(401);
  });

  it('GET /users/:userId - should return user details', async () => {
    const user = await UsersHelper.setupUser(app);

    const response = await request(app.getHttpServer())
      .get(`/users/${user.userId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(200);

    const responseBody = response.body as UserResponseDto;

    expect(responseBody.id).toBe(user.userId);
    // email is not exposed
    expect(responseBody.profile?.firstName).toBe(user.firstName);
    expect(responseBody.profile?.lastName).toBe(user.lastName);
  });

  it('GET /users/:userId - should return 404 for non-existent user', async () => {
    const user = await UsersHelper.setupUser(app);
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    const response = await request(app.getHttpServer())
      .get(`/users/${nonExistentId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(404);

    const responseBody = response.body as ErrorResponseProperties;

    expect(responseBody.errors[0].message).toBe(
      USER_EXCEPTIONS.USER_NOT_FOUND.message,
    );
    expect(responseBody.errors[0].code).toBe(
      USER_EXCEPTIONS.USER_NOT_FOUND.code,
    );
  });
});
