import { Profile } from './profile.entity';

export interface User {
  id: string;
  email: string;
  password: string;
  refreshToken?: string | null;
  profile?: Profile | null;
  createdAt: Date;
  updatedAt: Date;
}
