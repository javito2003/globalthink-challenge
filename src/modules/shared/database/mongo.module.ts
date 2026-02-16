import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomConfigService } from '../infrastructure/services/custom-config.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: CustomConfigService) => ({
        uri: configService.database.uri,
      }),
      inject: [CustomConfigService],
    }),
  ],
})
export class MongoModule {}
