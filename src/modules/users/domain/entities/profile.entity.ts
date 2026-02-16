export interface Profile {
  userId: string;
  firstName: string;
  lastName: string;
  bio?: string;
  birthDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
