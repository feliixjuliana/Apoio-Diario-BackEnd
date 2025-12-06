import userFactory from "../factories/user-factory";
import { User } from "../models/user-model";
import { UserRepository } from "../repositories/user-repository";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { config } from "../config/environment";

const googleClient = new OAuth2Client(config.google_client_id);

interface RegisterUserData {
  email: string;
  password: string;
}

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async registerUser(data: RegisterUserData): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) throw new Error("Email already exists");

    const passwordHash = await bcrypt.hash(data.password, 10);
    const newUser = userFactory.create({
      email: data.email,
      password: passwordHash,
    });

    return this.userRepository.save(newUser);
  }

  async validateUserLogin(email: string, passwordInput: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    const isValid =
      user &&
      user.password &&
      (await bcrypt.compare(passwordInput, user.password));

    if (!isValid) throw new Error("Invalid credentials");

    return user!;
  }

  async loginWithGoogle(googleToken: string): Promise<User> {
    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: config.google_client_id,
    });
    const { email } = ticket.getPayload() || {};

    if (!email) throw new Error("Invalid Google Token");

    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      user = userFactory.create({ email, password: undefined });
      await this.userRepository.save(user);
    }

    return user;
  }

  async sendForgotPasswordEmail(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("User not found");

    const resetToken = crypto.randomInt(100000, 999999).toString();
    user.resetToken = resetToken;
    user.resetExpires = new Date(Date.now() + 900000);

    await this.userRepository.update(user);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: config.email_user, pass: config.email_pass },
    });

    await transporter.sendMail({
      from: config.email_user,
      to: email,
      subject: "Reset Password Code",
      text: `Your code: ${resetToken}`,
    });
  }

  async resetPassword(
    email: string,
    code: string,
    newPasswordText: string
  ): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    const isTokenValid =
      user && user.resetToken === code && user.resetExpires! > new Date();

    if (!isTokenValid) throw new Error("Invalid or expired code");

    user!.password = await bcrypt.hash(newPasswordText, 10);
    user!.resetToken = undefined;
    user!.resetExpires = undefined;

    await this.userRepository.update(user!);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.getAll();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}
