import { children } from '@prisma/client';

export interface UserWithChildren {
  id: string;
  email: string;
  pinParental: number;
  createdAt: Date;
  resetToken?: string | null;
  resetExpires?: Date | null;
  children: children[];
}