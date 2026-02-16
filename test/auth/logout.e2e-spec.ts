import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppHelper } from '../helpers/app.helper';
import { DatabaseHelper } from '../helpers/database.helper';
import { createRegisterPayload } from '../factories/auth.factory';
import { AUTH_EXCEPTIONS } from '../../src/modules/auth/domain/exceptions/auth.exceptions';

describe('Auth - Logout (e2e)', () => {
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

  it('POST /auth/logout - success', async () => {
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

    const { accessToken } = loginResponse.body;

    // Verify user has refreshToken before logout
    const userBefore = await connection
      .collection('users')
      .findOne({ email: registerPayload.email });
    expect(userBefore?.refreshToken).not.toBeNull();
    expect(userBefore?.refreshToken).toBeDefined();

    // Logout
    const logoutResponse = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(logoutResponse.body).toHaveProperty('message');
    expect(logoutResponse.body.message).toBe('Logged out successfully');

    // Assert DB - User's refreshToken is set to null
    const userAfter = await connection
      .collection('users')
      .findOne({ email: registerPayload.email });
    expect(userAfter?.refreshToken).toBeNull();
  });

  it('POST /auth/logout - missing Bearer token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .expect(401);

    expect(response.body.errors[0].code).toBe(
      AUTH_EXCEPTIONS.INVALID_ACCESS_TOKEN.code,
    );
  });

  it('POST /auth/logout - invalid token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body.errors[0].code).toBe(
      AUTH_EXCEPTIONS.INVALID_ACCESS_TOKEN.code,
    );
    expect(response.body.errors[0].message).toBe(
      AUTH_EXCEPTIONS.INVALID_ACCESS_TOKEN.message,
    );
  });

  it('POST /auth/logout - using refresh token instead of access token', async () => {
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

    // Try to use refresh token for logout (should fail)
    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(401);

    expect(response.body.errors[0].code).toBe(
      AUTH_EXCEPTIONS.INVALID_ACCESS_TOKEN.code,
    );

    // Assert DB - refreshToken should still exist (logout didn't happen)
    const user = await connection
      .collection('users')
      .findOne({ email: registerPayload.email });
    expect(user?.refreshToken).not.toBeNull();
  });

  it('POST /auth/logout - already logged out', async () => {
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

    // First logout
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Try to logout again with same access token (should still work since access token is still valid)
    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.message).toBe('Logged out successfully');

    // Assert DB - refreshToken should still be null
    const user = await connection
      .collection('users')
      .findOne({ email: registerPayload.email });
    expect(user?.refreshToken).toBeNull();
  });
});
