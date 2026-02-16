import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppHelper } from '../helpers/app.helper';
import { DatabaseHelper } from '../helpers/database.helper';
import { UsersHelper } from './users.helper';
import { App } from 'supertest/types';
import { UserResponseDto } from 'src/modules/users/presentation/dtos/user-response.dto';

describe('Users - Update User Profile (e2e)', () => {
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

  it('PUT /users/:userId - should update own profile', async () => {
    const user = await UsersHelper.setupUser(app);
    const updateData = {
      firstName: 'UpdatedFirst',
      lastName: 'UpdatedLast',
      bio: 'New Bio',
    };

    const response = await request(app.getHttpServer())
      .put(`/users/${user.userId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send(updateData)
      .expect(200);

    const responseBody = response.body as UserResponseDto;

    expect(responseBody.profile?.firstName).toBe(updateData.firstName);
    expect(responseBody.profile?.lastName).toBe(updateData.lastName);
    expect(responseBody.profile?.bio).toBe(updateData.bio);

    // Verify persistence
    const getResponse = await request(app.getHttpServer())
      .get(`/users/${user.userId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(200);

    const getResponseBody = getResponse.body as UserResponseDto;

    expect(getResponseBody.profile?.firstName).toBe(updateData.firstName);
  });

  it('PUT /users/:userId - should forbid updating another user', async () => {
    const user1 = await UsersHelper.setupUser(app);
    const user2 = await UsersHelper.setupUser(app);

    const updateData = {
      firstName: 'Hacker',
    };

    await request(app.getHttpServer())
      .put(`/users/${user2.userId}`) // User 1 tries to update User 2
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .send(updateData)
      .expect(403); // Forbidden
  });

  it('PUT /users/:userId - should return 404 for non-existent user', async () => {
    const user = await UsersHelper.setupUser(app);
    const nonExistentId = '000000000000000000000000'; // Valid 24 char hex string

    const updateData = {
      firstName: 'New Name',
    };

    await request(app.getHttpServer())
      .put(`/users/${nonExistentId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send(updateData)
      .expect(404);
  });
});
