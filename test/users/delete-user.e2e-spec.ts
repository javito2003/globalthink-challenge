import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppHelper } from '../helpers/app.helper';
import { DatabaseHelper } from '../helpers/database.helper';
import { UsersHelper } from './users.helper';
import { App } from 'supertest/types';
import mongoose from 'mongoose';

describe('Users - Delete User (e2e)', () => {
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

  it('DELETE /users/:userId - should delete own account', async () => {
    const user = await UsersHelper.setupUser(app);

    await request(app.getHttpServer())
      .delete(`/users/${user.userId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(200);

    // Verify deletion
    await request(app.getHttpServer())
      .get(`/users/${user.userId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(404);
  });

  it('DELETE /users/:userId - should forbid deleting another user', async () => {
    const user1 = await UsersHelper.setupUser(app);
    const user2 = await UsersHelper.setupUser(app);

    await request(app.getHttpServer())
      .delete(`/users/${user2.userId}`) // User 1 tries to delete User 2
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(403);

    // Verify user 2 still exists
    await request(app.getHttpServer())
      .get(`/users/${user2.userId}`)
      .set('Authorization', `Bearer ${user2.accessToken}`)
      .expect(200);
  });

  it('DELETE /users/:userId - should return 404 for non-existent user', async () => {
    const user = await UsersHelper.setupUser(app);
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    await request(app.getHttpServer())
      .delete(`/users/${nonExistentId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(404);
  });
});
