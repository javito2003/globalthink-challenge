import { User } from '../../../domain/entities/user.entity';
import { User as UserSchema, UserDocument } from '../schemas/user.schema';

export class UserMapper {
  static toEntity(userDoc: UserDocument): User {
    return {
      id: userDoc._id.toString(),
      email: userDoc.email,
      password: userDoc.password,
      refreshToken: userDoc.refreshToken,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    };
  }

  static toSchema(user: User): UserSchema {
    return {
      email: user.email,
      password: user.password,
      refreshToken: user.refreshToken,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
