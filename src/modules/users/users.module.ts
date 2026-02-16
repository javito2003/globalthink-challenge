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
import { ProfileRepository } from './infrastructure/persistence/repositories/profie.repository';
import {
  USER_REPOSITORY_TOKEN,
  PROFILE_REPOSITORY_TOKEN,
} from './domain/repositories/repository.tokens';

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
  providers: [
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepository,
    },
    {
      provide: PROFILE_REPOSITORY_TOKEN,
      useClass: ProfileRepository,
    },
  ],
  exports: [USER_REPOSITORY_TOKEN, PROFILE_REPOSITORY_TOKEN],
})
export class UsersModule {}
