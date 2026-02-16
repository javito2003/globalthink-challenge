import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppHelper } from '../helpers/app.helper';
import { DatabaseHelper } from '../helpers/database.helper';
import { createRegisterPayload } from '../factories/auth.factory';
import { AUTH_EXCEPTIONS } from '../../src/modules/auth/domain/exceptions/auth.exceptions';
import { App } from 'supertest/types';
import { ITokenPair } from 'src/modules/auth/domain/services/token.service.interface';
import { ErrorResponseProperties } from 'src/modules/shared/presentation/api/build-error-response.properties';

describe('Auth - Logout (e2e)', () => {
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

    const responseBody = loginResponse.body as ITokenPair;

    const { accessToken } = responseBody;

    // Logout
    const logoutResponse = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(logoutResponse.body).toHaveProperty('message');
  });

  it('POST /auth/logout - missing Bearer token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .expect(401);

    const responseBody = response.body as ErrorResponseProperties;

    expect(responseBody.errors[0].code).toBe(
      AUTH_EXCEPTIONS.INVALID_ACCESS_TOKEN.code,
    );
  });

  it('POST /auth/logout - invalid token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    const responseBody = response.body as ErrorResponseProperties;

    expect(responseBody.errors[0].code).toBe(
      AUTH_EXCEPTIONS.INVALID_ACCESS_TOKEN.code,
    );
    expect(responseBody.errors[0].message).toBe(
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

    const { refreshToken } = loginResponse.body as ITokenPair;

    // Try to use refresh token for logout (should fail)
    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(401);

    const responseBody = response.body as ErrorResponseProperties;
    expect(responseBody.errors[0].code).toBe(
      AUTH_EXCEPTIONS.INVALID_ACCESS_TOKEN.code,
    );
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

    const { accessToken } = loginResponse.body as ITokenPair;

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

    const responseBody = response.body as ErrorResponseProperties;
    expect(responseBody.message).toBe('Logged out successfully');
  });
});
