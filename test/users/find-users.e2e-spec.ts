import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppHelper } from '../helpers/app.helper';
import { DatabaseHelper } from '../helpers/database.helper';
import { UsersHelper } from './users.helper';
import { App } from 'supertest/types';
import { UserResponseDto } from 'src/modules/users/presentation/dtos/user-response.dto';
import { PaginationMeta } from 'src/modules/shared/infrastructure/dtos/paginated-response.dto';
import { SortDirection } from 'src/modules/shared/domain/enums/sort-direction.enum';

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

  it('GET /users - should return a paginated list of users with default parameters', async () => {
    const user1 = await UsersHelper.setupUser(app);
    const user2 = await UsersHelper.setupUser(app);

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(200);

    const responseBody = response.body as {
      data: UserResponseDto[];
      meta: PaginationMeta;
    };

    expect(responseBody.data).toHaveLength(2);
    expect(responseBody.meta).toEqual({
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    const firstNames = responseBody.data.map((u) => u.profile?.firstName);
    expect(firstNames).toContain(user1.firstName);
    expect(firstNames).toContain(user2.firstName);
  });

  it('GET /users - should paginate results correctly', async () => {
    const user1 = await UsersHelper.setupUser(app);
    await UsersHelper.setupUser(app);
    await UsersHelper.setupUser(app);

    // Get first page with limit 1
    const response1 = await request(app.getHttpServer())
      .get('/users?page=1&limit=1')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(200);

    const responseBody1 = response1.body as {
      data: UserResponseDto[];
      meta: PaginationMeta;
    };

    expect(responseBody1.data).toHaveLength(1);
    expect(responseBody1.meta).toEqual({
      total: 3,
      page: 1,
      limit: 1,
      totalPages: 3,
    });

    // Get second page
    const response2 = await request(app.getHttpServer())
      .get('/users?page=2&limit=1')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(200);

    const responseBody2 = response2.body as {
      data: UserResponseDto[];
      meta: PaginationMeta;
    };

    expect(responseBody2.data).toHaveLength(1);
    expect(responseBody2.meta.page).toBe(2);
    expect(responseBody2.data[0].id).not.toBe(responseBody1.data[0].id);
  });

  it('GET /users - should sort by createdAt DESC by default', async () => {
    const user1 = await UsersHelper.setupUser(app);
    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));
    const user2 = await UsersHelper.setupUser(app);

    const response = await request(app.getHttpServer())
      .get(`/users?sortBy=createdAt&sortDir=${SortDirection.DESC}`)
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(200);

    const responseBody = response.body as { data: UserResponseDto[] };

    // user2 should come first (newest)
    expect(responseBody.data[0].profile?.firstName).toBe(user2.firstName);
    expect(responseBody.data[1].profile?.firstName).toBe(user1.firstName);
  });

  it('GET /users - should sort by createdAt ASC when specified', async () => {
    const user1 = await UsersHelper.setupUser(app);
    await new Promise((resolve) => setTimeout(resolve, 10));
    const user2 = await UsersHelper.setupUser(app);

    const response = await request(app.getHttpServer())
      .get('/users?sortBy=createdAt&sortDir=ASC')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(200);

    const responseBody = response.body as { data: UserResponseDto[] };

    // user1 should come first (oldest)
    expect(responseBody.data[0].profile?.firstName).toBe(user1.firstName);
    expect(responseBody.data[1].profile?.firstName).toBe(user2.firstName);
  });

  it('GET /users - should filter by firstName search term', async () => {
    const user1 = await UsersHelper.setupUser(app, {
      firstName: 'John',
      lastName: 'Doe',
    });
    await UsersHelper.setupUser(app, {
      firstName: 'Jane',
      lastName: 'Smith',
    });

    const response = await request(app.getHttpServer())
      .get('/users?search=joh')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(200);

    const responseBody = response.body as {
      data: UserResponseDto[];
      meta: PaginationMeta;
    };

    expect(responseBody.data).toHaveLength(1);
    expect(responseBody.meta.total).toBe(1);
    expect(responseBody.data[0].profile?.firstName).toBe('John');
  });

  it('GET /users - should filter by lastName search term', async () => {
    const user1 = await UsersHelper.setupUser(app, {
      firstName: 'John',
      lastName: 'Doe',
    });
    await UsersHelper.setupUser(app, {
      firstName: 'Jane',
      lastName: 'Smith',
    });

    const response = await request(app.getHttpServer())
      .get('/users?search=smith')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(200);

    const responseBody = response.body as {
      data: UserResponseDto[];
      meta: PaginationMeta;
    };

    expect(responseBody.data).toHaveLength(1);
    expect(responseBody.meta.total).toBe(1);
    expect(responseBody.data[0].profile?.lastName).toBe('Smith');
  });

  it('GET /users - should return empty array for non-matching search', async () => {
    const user1 = await UsersHelper.setupUser(app);

    const response = await request(app.getHttpServer())
      .get('/users?search=nonexistent')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(200);

    const responseBody = response.body as {
      data: UserResponseDto[];
      meta: PaginationMeta;
    };

    expect(responseBody.data).toHaveLength(0);
    expect(responseBody.meta.total).toBe(0);
  });

  it('GET /users - should be case-insensitive for search', async () => {
    const user1 = await UsersHelper.setupUser(app, {
      firstName: 'John',
      lastName: 'Doe',
    });

    const response = await request(app.getHttpServer())
      .get('/users?search=JOHN')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(200);

    const responseBody = response.body as { data: UserResponseDto[] };

    expect(responseBody.data).toHaveLength(1);
    expect(responseBody.data[0].profile?.firstName).toBe('John');
  });

  it('GET /users - should work without sorting parameters', async () => {
    const user1 = await UsersHelper.setupUser(app);
    const user2 = await UsersHelper.setupUser(app);

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(200);

    const responseBody = response.body as {
      data: UserResponseDto[];
      meta: PaginationMeta;
    };

    expect(responseBody.data).toHaveLength(2);
    expect(responseBody.meta.total).toBe(2);
    // Without sorting, order is not guaranteed but both users should be present
    const userIds = responseBody.data.map((u) => u.id);
    expect(userIds).toContain(user1.userId);
    expect(userIds).toContain(user2.userId);
  });

  it('GET /users - should fail without authorization', async () => {
    await request(app.getHttpServer()).get('/users').expect(401);
  });
});
