import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
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
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
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
