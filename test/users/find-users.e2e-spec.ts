import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppHelper } from '../helpers/app.helper';
import { DatabaseHelper } from '../helpers/database.helper';
import { UsersHelper } from './users.helper';
import { App } from 'supertest/types';
import { UserResponseDto } from 'src/modules/users/presentation/dtos/user-response.dto';

describe('Users - Find Users (e2e)', () => {
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

  it('GET /users - should return a list of users', async () => {
    const user1 = await UsersHelper.setupUser(app);
    const user2 = await UsersHelper.setupUser(app);

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(200);

    const responseBody = response.body as {
      users: UserResponseDto[];
      count: number;
    };

    expect(responseBody.users).toHaveLength(2);
    expect(responseBody.count).toBe(2);

    const firstNames = responseBody.users.map((u) => u.profile?.firstName);
    expect(firstNames).toContain(user1.firstName);
    expect(firstNames).toContain(user2.firstName);
  });

  it('GET /users - should fail without authorization', async () => {
    await request(app.getHttpServer()).get('/users').expect(401);
  });
});
