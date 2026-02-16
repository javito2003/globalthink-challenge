import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './presentation/controllers/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import {
  BCRYPT_SERVICE_NAME,
  BcryptPasswordHasher,
} from './infrastructure/services/bcrypt-hasher.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    {
      provide: BCRYPT_SERVICE_NAME,
      useClass: BcryptPasswordHasher,
    },
    LoginUseCase,
  ],
})
export class AuthModule {}
