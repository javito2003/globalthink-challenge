import { Profile } from '../entities/profile.entity';

export class CreateProfileDto {
  userId: string;
  firstName: string;
  lastName: string;
  bio?: string;
  birthdate: Date;
}

export interface IProfileRepository {
  create(profile: CreateProfileDto): Promise<Profile>;
}
