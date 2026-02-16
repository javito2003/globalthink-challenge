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
import { UserRepository } from './infrastructure/persistence/user.repository';

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
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UsersModule {}
