import { randomUUID } from 'crypto';

export class User {
  id: string;
  email: string;
  password?: string;
  pinParental?: number;
  createdAt: Date;
  resetToken?: string;
  resetExpires?: Date;

  constructor(partial: Partial<User>) {
    this.id = partial.id || randomUUID();
    this.email = partial.email!;
    this.password = partial.password;
    this.pinParental = partial.pinParental;
    this.createdAt = partial.createdAt || new Date();
    this.resetToken = partial.resetToken;
    this.resetExpires = partial.resetExpires;
  }
}