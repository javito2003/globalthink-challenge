import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
} from './infrastructure/persistence/schemas/user.schema';
import {
  Profile,
  ProfileSchema,
} from './infrastructure/persistence/schemas/profile.schema';
import { UserRepository } from './infrastructure/persistence/repositories/user.repository';
import { ProfileRepository } from './infrastructure/persistence/repositories/profile.repository';
import {
  USER_REPOSITORY_TOKEN,
  PROFILE_REPOSITORY_TOKEN,
} from './domain/repositories/repository.tokens';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { UpdateUserProfileByIdUseCase } from './application/use-cases/update-user-profile-by-id.use-case';
import { FindUsersUseCase } from './application/use-cases/find-users.use-case';
import { UsersController } from './presentation/controllers/users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Profile.name,
        schema: ProfileSchema,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepository,
    },
    {
      provide: PROFILE_REPOSITORY_TOKEN,
      useClass: ProfileRepository,
    },
    FindUserByIdUseCase,
    UpdateUserProfileByIdUseCase,
    FindUsersUseCase,
  ],
  exports: [USER_REPOSITORY_TOKEN, PROFILE_REPOSITORY_TOKEN],
})
export class UsersModule {}
