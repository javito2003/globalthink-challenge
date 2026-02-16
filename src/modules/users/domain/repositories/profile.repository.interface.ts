import { Profile } from '../entities/profile.entity';

export class CreateProfileDto {
  userId: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  bio?: string;
}

export interface IProfileRepository {
  create(profile: CreateProfileDto): Promise<Profile>;
}
