import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../../src/app.module';
import { setupApp } from '../../src/setup-app';
import { App } from 'supertest/types';

export class AppHelper {
  static async createTestApp(): Promise<{
    app: INestApplication<App>;
    mongoServer: MongoMemoryServer;
  }> {
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Override MONGO_URI for this test
    process.env.MONGO_URI = mongoUri;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();

    return { app: app as INestApplication<App>, mongoServer };
  }

  static async closeApp(
    app: INestApplication<App>,
    mongoServer: MongoMemoryServer,
  ): Promise<void> {
    await app.close();
    await mongoServer.stop();
  }
}
