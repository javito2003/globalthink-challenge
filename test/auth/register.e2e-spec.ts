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
import {
  USER_REPOSITORY_TOKEN,
  PROFILE_REPOSITORY_TOKEN,
} from 'src/modules/users/domain/repositories/repository.tokens';
import type { IUserRepository } from 'src/modules/users/domain/repositories/user.repository.interface';
import type { IProfileRepository } from 'src/modules/users/domain/repositories/profile.repository.interface';

describe('Auth - Register (e2e)', () => {
  let app: INestApplication<App>;
  let mongoServer: MongoMemoryServer;
  let userRepository: IUserRepository;
  let profileRepository: IProfileRepository;

  beforeAll(async () => {
    const testApp = await AppHelper.createTestApp();
    app = testApp.app;
    mongoServer = testApp.mongoServer;

    // Get repositories from DI container
    userRepository = app.get<IUserRepository>(USER_REPOSITORY_TOKEN);
    profileRepository = app.get<IProfileRepository>(PROFILE_REPOSITORY_TOKEN);
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

    // Assert DB using repositories
    const user = await userRepository.findByEmail(payload.email);
    expect(user).toBeDefined();
    expect(user!.email).toBe(payload.email);
    expect(user!.password).not.toBe(payload.password); // Password should be hashed
    expect(user!.refreshToken).toBeDefined(); // refreshToken should be stored
    expect(user!.refreshToken).not.toBeNull();
    expect(user!.refreshToken).not.toBe(responseBody.refreshToken); // Should be hashed

    const profile = await profileRepository.findByUserId(user!.id);
    expect(profile).toBeDefined();
    expect(profile!.firstName).toBe(payload.firstName);
    expect(profile!.lastName).toBe(payload.lastName);
    expect(new Date(profile!.birthDate).toISOString().split('T')[0]).toBe(
      payload.birthDate,
    );
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

    // Assert DB - Only one user exists
    const user = await userRepository.findByEmail(payload.email);
    expect(user).toBeDefined();
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

    // Assert DB - No user created
    const user = await userRepository.findByEmail('test@example.com');
    expect(user).toBeNull();
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

    // Assert DB - No user created
    const user = await userRepository.findByEmail(payload.email);
    expect(user).toBeNull();
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

    // Assert DB - No user created
    const user = await userRepository.findByEmail(payload.email);
    expect(user).toBeNull();
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

    // Assert DB - No user created
    const user = await userRepository.findByEmail(payload.email);
    expect(user).toBeNull();
  });

  it('POST /auth/register - can refresh immediately after registration', async () => {
    const payload = createRegisterPayload();

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(201);

    const { refreshToken } = registerResponse.body as ITokenPair;

    // Should be able to refresh immediately after registration
    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(200);

    const refreshResponseBody = refreshResponse.body as ITokenPair;
    expect(refreshResponseBody).toHaveProperty('accessToken');
    expect(refreshResponseBody).toHaveProperty('refreshToken');
    expect(refreshResponseBody.refreshToken).not.toBe(refreshToken); // Should get new token
  });
});
