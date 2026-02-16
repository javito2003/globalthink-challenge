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
  providers: [UserRepository, ProfileRepository],
  exports: [UserRepository, ProfileRepository],
})
export class UsersModule {}
