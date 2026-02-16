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
import { faker } from '@faker-js/faker';
import {
  MAX_USER_PASSWORD_LENGTH,
  MIN_USER_PASSWORD_LENGTH,
} from 'src/modules/users/domain/entities/user.entity';

describe('Auth - Register (e2e)', () => {
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

  it('POST /auth/register - success', async () => {
    const payload = createRegisterPayload();

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(201);

    const responseBody = response.body as ITokenPair;

    expect(responseBody).toHaveProperty('accessToken');
    expect(responseBody).toHaveProperty('refreshToken');
    expect(typeof responseBody.accessToken).toBe('string');
    expect(typeof responseBody.refreshToken).toBe('string');
  });

  it('POST /auth/register - duplicate email', async () => {
    const payload = createRegisterPayload();

    // Create user first
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(201);

    // Try to register with same email
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(409);

    const responseBody = response.body as ErrorResponseProperties;

    expect(responseBody.errors[0].code).toBe(
      AUTH_EXCEPTIONS.EMAIL_ALREADY_IN_USE.code,
    );
    expect(responseBody.errors[0].message).toBe(
      AUTH_EXCEPTIONS.EMAIL_ALREADY_IN_USE.message,
    );
  });

  it('POST /auth/register - invalid data (missing fields)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        // Missing password, firstName, lastName, birthDate
      })
      .expect(400);

    const responseBody = response.body as ErrorResponseProperties;
    expect(responseBody.message).toBe('Validation failed');
    expect(responseBody.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'password' }),
        expect.objectContaining({ field: 'firstName' }),
        expect.objectContaining({ field: 'lastName' }),
        expect.objectContaining({ field: 'birthDate' }),
      ]),
    );
  });

  it('POST /auth/register - invalid email format', async () => {
    const payload = createRegisterPayload({ email: 'invalid-email' });

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(400);

    const responseBody = response.body as ErrorResponseProperties;
    expect(responseBody.message).toBe('Validation failed');
    expect(responseBody.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'email' })]),
    );
  });

  it('POST /auth/register - password too short', async () => {
    const payload = createRegisterPayload({
      password: faker.string.alpha(MIN_USER_PASSWORD_LENGTH - 1),
    });

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(400);

    const responseBody = response.body as ErrorResponseProperties;
    expect(responseBody.message).toBe('Validation failed');
    expect(responseBody.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'password' })]),
    );
  });

  it('POST /auth/register - password too long', async () => {
    const payload = createRegisterPayload({
      password: faker.string.alpha(MAX_USER_PASSWORD_LENGTH + 1),
    });

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(400);

    const responseBody = response.body as ErrorResponseProperties;
    expect(responseBody.message).toBe('Validation failed');
    expect(responseBody.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'password' })]),
    );
  });
});
