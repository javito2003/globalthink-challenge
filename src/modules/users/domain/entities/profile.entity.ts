export interface Profile {
  userId: string;
  firstName: string;
  lastName: string;
  bio?: string;
  birthdate: Date;
  createdAt: Date;
  updatedAt: Date;
}
