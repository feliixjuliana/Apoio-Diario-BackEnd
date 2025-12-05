import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/user-model';

export default {
  create: (data: { email: string; password?: string }): User => {
    return new User({
      id: uuidv4(),
      email: data.email,
      password: data.password,
      createdAt: new Date(),
    });
  },
};