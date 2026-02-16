import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export class DatabaseHelper {
  static async cleanDatabase(app: INestApplication): Promise<void> {
    const connection = app.get<Connection>(getConnectionToken());
    await connection.collection('users').deleteMany({});
    await connection.collection('profiles').deleteMany({});
  }
}
