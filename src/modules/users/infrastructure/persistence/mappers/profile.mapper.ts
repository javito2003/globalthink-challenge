import { Profile } from 'src/modules/users/domain/entities/profile.entity';
import { ProfileDocument } from '../schemas/profile.schema';

export class ProfileMapper {
  static toEntity(profileDoc: ProfileDocument): Profile {
    return {
      userId: profileDoc.userId,
      firstName: profileDoc.firstName,
      lastName: profileDoc.lastName,
      bio: profileDoc.bio,
      birthDate: profileDoc.birthDate,
      createdAt: profileDoc.createdAt,
      updatedAt: profileDoc.updatedAt,
    };
  }
}
