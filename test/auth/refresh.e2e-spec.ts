import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppHelper } from '../helpers/app.helper';
import { DatabaseHelper } from '../helpers/database.helper';
import { createRegisterPayload } from '../factories/auth.factory';
import { AUTH_EXCEPTIONS } from '../../src/modules/auth/domain/exceptions/auth.exceptions';

describe('Auth - Refresh (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let connection: Connection;

  beforeAll(async () => {
    const testApp = await AppHelper.createTestApp();
    app = testApp.app;
    mongoServer = testApp.mongoServer;
    connection = app.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await AppHelper.closeApp(app, mongoServer);
  });

  afterEach(async () => {
    await DatabaseHelper.cleanDatabase(app);
  });

  it('POST /auth/refresh - success', async () => {
    // First register and login to get tokens
    const registerPayload = createRegisterPayload();
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerPayload)
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: registerPayload.email,
        password: registerPayload.password,
      })
      .expect(200);

    const { refreshToken: oldRefreshToken } = loginResponse.body;

    // Get user before refresh to check refreshToken state
    const userBefore = await connection
      .collection('users')
      .findOne({ email: registerPayload.email });
    const oldHashedRefreshToken = userBefore?.refreshToken;
    expect(oldHashedRefreshToken).toBeDefined();
    expect(oldHashedRefreshToken).not.toBeNull();

    // Use refresh token to get new tokens
    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${oldRefreshToken}`)
      .expect(200);

    expect(refreshResponse.body).toHaveProperty('accessToken');
    expect(refreshResponse.body).toHaveProperty('refreshToken');
    expect(typeof refreshResponse.body.accessToken).toBe('string');
    expect(typeof refreshResponse.body.refreshToken).toBe('string');

    // Assert DB - User's refreshToken is updated to new hashed token
    const userAfter = await connection
      .collection('users')
      .findOne({ email: registerPayload.email });
    expect(userAfter?.refreshToken).toBeDefined();
    expect(userAfter?.refreshToken).not.toBeNull();
    expect(userAfter?.refreshToken).not.toBe(oldHashedRefreshToken); // Should be updated
    expect(userAfter?.refreshToken).not.toBe(
      refreshResponse.body.refreshToken,
    ); // Should be hashed
  });

  it('POST /auth/refresh - invalid token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body.errors[0].code).toBe(
      AUTH_EXCEPTIONS.INVALID_REFRESH_TOKEN.code,
    );
    expect(response.body.errors[0].message).toBe(
      AUTH_EXCEPTIONS.INVALID_REFRESH_TOKEN.message,
    );
  });

  it('POST /auth/refresh - missing Bearer token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .expect(401);

    expect(response.body.errors[0].code).toBe(
      AUTH_EXCEPTIONS.INVALID_REFRESH_TOKEN.code,
    );
  });

  it('POST /auth/refresh - expired token format', async () => {
    // Register and login to get tokens
    const registerPayload = createRegisterPayload();
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerPayload)
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: registerPayload.email,
        password: registerPayload.password,
      })
      .expect(200);

    const { refreshToken } = loginResponse.body;

    // Logout to invalidate the refresh token (sets it to null in DB)
    const accessToken = loginResponse.body.accessToken;
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Try to use the old refresh token after logout
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(401);

    expect(response.body.errors[0].code).toBe(
      AUTH_EXCEPTIONS.INVALID_REFRESH_TOKEN.code,
    );
  });

  it('POST /auth/refresh - using access token instead of refresh token', async () => {
    // Register and login to get tokens
    const registerPayload = createRegisterPayload();
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerPayload)
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: registerPayload.email,
        password: registerPayload.password,
      })
      .expect(200);

    const { accessToken } = loginResponse.body;

    // Try to use access token for refresh (should fail)
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);

    expect(response.body.errors[0].code).toBe(
      AUTH_EXCEPTIONS.INVALID_REFRESH_TOKEN.code,
    );
  });
});
