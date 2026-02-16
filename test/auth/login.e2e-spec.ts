import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppHelper } from '../helpers/app.helper';
import { DatabaseHelper } from '../helpers/database.helper';
import {
  createRegisterPayload,
  createLoginPayload,
} from '../factories/auth.factory';
import { AUTH_EXCEPTIONS } from '../../src/modules/auth/domain/exceptions/auth.exceptions';
import { App } from 'supertest/types';
import { ErrorResponseProperties } from 'src/modules/shared/presentation/api/build-error-response.properties';

describe('Auth - Login (e2e)', () => {
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

  it('POST /auth/login - success', async () => {
    // First register a user
    const registerPayload = createRegisterPayload();
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerPayload)
      .expect(201);

    // Login with registered credentials
    const loginPayload = createLoginPayload({
      email: registerPayload.email,
      password: registerPayload.password,
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginPayload)
      .expect(200);

    const responseBody = response.body as {
      accessToken: string;
      refreshToken: string;
    };

    expect(responseBody).toHaveProperty('accessToken');
    expect(responseBody).toHaveProperty('refreshToken');
    expect(typeof responseBody.accessToken).toBe('string');
    expect(typeof responseBody.refreshToken).toBe('string');
  });

  it('POST /auth/login - non-existent email', async () => {
    const loginPayload = createLoginPayload();

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginPayload)
      .expect(401);

    const responseBody = response.body as ErrorResponseProperties;

    expect(responseBody.errors[0].code).toBe(
      AUTH_EXCEPTIONS.INVALID_CREDENTIALS.code,
    );
    expect(responseBody.errors[0].message).toBe(
      AUTH_EXCEPTIONS.INVALID_CREDENTIALS.message,
    );
  });

  it('POST /auth/login - wrong password', async () => {
    // First register a user
    const registerPayload = createRegisterPayload();
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerPayload)
      .expect(201);

    // Try to login with wrong password
    const loginPayload = createLoginPayload({
      email: registerPayload.email,
      password: 'WrongPassword123',
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginPayload)
      .expect(401);

    const responseBody = response.body as ErrorResponseProperties;

    expect(responseBody.errors[0].code).toBe(
      AUTH_EXCEPTIONS.INVALID_CREDENTIALS.code,
    );
    expect(responseBody.errors[0].message).toBe(
      AUTH_EXCEPTIONS.INVALID_CREDENTIALS.message,
    );
  });

  it('POST /auth/login - invalid email format', async () => {
    const loginPayload = createLoginPayload({ email: 'invalid-email' });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginPayload)
      .expect(400);

    const responseBody = response.body as ErrorResponseProperties;

    expect(responseBody.message).toBe('Validation failed');
    expect(responseBody.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'email' })]),
    );
  });

  it('POST /auth/login - missing password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        // Missing password
      })
      .expect(400);

    const responseBody = response.body as ErrorResponseProperties;
    expect(responseBody.message).toBe('Validation failed');
    expect(responseBody.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'password' })]),
    );
  });

  it('POST /auth/login - password too short', async () => {
    const loginPayload = createLoginPayload({ password: '12345' });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginPayload)
      .expect(400);

    const responseBody = response.body as ErrorResponseProperties;
    expect(responseBody.message).toBe('Validation failed');
    expect(responseBody.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'password' })]),
    );
  });
});
