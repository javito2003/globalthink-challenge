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

describe('Auth - Refresh (e2e)', () => {
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

    const { refreshToken: oldRefreshToken } = loginResponse.body as ITokenPair;

    // Use refresh token to get new tokens
    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${oldRefreshToken}`)
      .expect(200);

    const refreshResponseBody = refreshResponse.body as ITokenPair;

    expect(refreshResponseBody).toHaveProperty('accessToken');
    expect(refreshResponseBody).toHaveProperty('refreshToken');
    expect(typeof refreshResponseBody.accessToken).toBe('string');
    expect(typeof refreshResponseBody.refreshToken).toBe('string');
  });

  it('POST /auth/refresh - invalid token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    const responseBody = response.body as ErrorResponseProperties;

    expect(responseBody.errors[0].code).toBe(
      AUTH_EXCEPTIONS.INVALID_REFRESH_TOKEN.code,
    );
    expect(responseBody.errors[0].message).toBe(
      AUTH_EXCEPTIONS.INVALID_REFRESH_TOKEN.message,
    );
  });

  it('POST /auth/refresh - missing Bearer token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .expect(401);

    const responseBody = response.body as ErrorResponseProperties;

    expect(responseBody.errors[0].code).toBe(
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

    const { refreshToken, accessToken } = loginResponse.body as ITokenPair;

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Try to use the old refresh token after logout
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(401);

    const responseBody = response.body as ErrorResponseProperties;

    expect(responseBody.errors[0].code).toBe(
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

    const { accessToken } = loginResponse.body as ITokenPair;

    // Try to use access token for refresh (should fail)
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);

    const responseBody = response.body as ErrorResponseProperties;
    expect(responseBody.errors[0].code).toBe(
      AUTH_EXCEPTIONS.INVALID_REFRESH_TOKEN.code,
    );
  });
});
