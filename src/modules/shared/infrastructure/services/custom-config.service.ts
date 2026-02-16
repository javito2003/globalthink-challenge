import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomConfigService {
  readonly jwt: {
    accessSecret: string;
    refreshSecret: string;
  };

  readonly database: {
    uri: string;
  };

  constructor(private readonly configService: ConfigService) {
    this.jwt = {
      accessSecret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      refreshSecret:
        this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    };

    this.database = {
      uri: this.configService.getOrThrow<string>('MONGO_URI'),
    };
  }
}
