export interface User {
  id: string;
  email: string;
  password: string;
  refreshToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
