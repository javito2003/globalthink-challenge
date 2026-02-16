import { Profile } from './profile.entity';

export const MIN_USER_PASSWORD_LENGTH = 6;
export const MAX_USER_PASSWORD_LENGTH = 20;

export interface User {
  id: string;
  email: string;
  password: string;
  refreshToken?: string | null;
  profile?: Profile | null;
  createdAt: Date;
  updatedAt: Date;
}
