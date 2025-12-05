import { v4 as uuidv4 } from 'uuid';

export interface UserProps {
  id?: string;
  email: string;
  password?: string;
  createdAt?: Date;
  resetToken?: string;
  resetExpires?: Date;
}

export class User {
  public readonly id: string;
  public email: string;
  public password?: string;
  public createdAt: Date;
  public resetToken?: string;
  public resetExpires?: Date;

  constructor(props: UserProps) {
    this.id = props.id || uuidv4();
    this.email = props.email;
    this.password = props.password;
    this.createdAt = props.createdAt || new Date();
    this.resetToken = props.resetToken;
    this.resetExpires = props.resetExpires;
  }
}