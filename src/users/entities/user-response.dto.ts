import { Child } from 'src/children/entities/child.entity';

export interface UserWithChildren {
  id: string;
  email: string;
  createdAt: Date;
  resetToken?: string | null;
  resetExpires?: Date | null;
  children: Child[];
}
