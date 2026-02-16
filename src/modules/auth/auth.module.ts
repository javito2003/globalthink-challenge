import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { CustomConfigService } from '../shared/infrastructure/services/custom-config.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import {
  BCRYPT_SERVICE_NAME,
  BcryptPasswordHasher,
} from './infrastructure/services/bcrypt-hasher.service';
import {
  TOKEN_SERVICE_NAME,
  JwtTokenService,
} from './infrastructure/services/jwt-token.service';
import { JwtAccessStrategy } from './infrastructure/strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './infrastructure/strategies/jwt-refresh.strategy';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [CustomConfigService],
      useFactory: async (configService: CustomConfigService) => ({
        secret: configService.jwt.accessSecret,
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: BCRYPT_SERVICE_NAME,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: TOKEN_SERVICE_NAME,
      useClass: JwtTokenService,
    },
    JwtAccessStrategy,
    JwtRefreshStrategy,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
  ],
})
export class AuthModule {}
