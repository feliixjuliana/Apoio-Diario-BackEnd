import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly userRepository: UsersRepository,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('google.clientId'),
    );
  }

  async registerUser(data: any): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) throw new ConflictException('Email already exists');
    const passwordHash = await bcrypt.hash(data.password, 10);
    const newUser = new User({ email: data.email, password: passwordHash });
    return this.userRepository.save(newUser);
  }

  async validateUserLogin(email: string, pass: string) {
    const user = await this.userRepository.findByEmail(email);
    const isValid =
      user && user.password && (await bcrypt.compare(pass, user.password));
    if (!isValid) throw new UnauthorizedException('Invalid credentials');
    return this.generateToken(user);
  }

  async loginWithGoogle(googleToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: googleToken,
      audience: this.configService.get<string>('google.clientId'),
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email)
      throw new UnauthorizedException('Invalid Google Token');

    let user = await this.userRepository.findByEmail(payload.email);
    if (!user) {
      user = new User({ email: payload.email });
      await this.userRepository.save(user);
    }
    return this.generateToken(user);
  }

  async sendForgotPasswordEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    const resetToken = crypto.randomInt(100000, 999999).toString();
    user.resetToken = resetToken;
    user.resetExpires = new Date(Date.now() + 900000);
    await this.userRepository.update(user);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('email.user'),
        pass: this.configService.get<string>('email.pass'),
      },
    });
    await transporter.sendMail({
      from: this.configService.get<string>('email.user'),
      to: email,
      subject: 'Reset Password Code',
      text: `Your code: ${resetToken}`,
    });
  }

  async resetPassword(email: string, newPass: string) {
    const user = await this.userRepository.findByEmail(email);
    const isValid = user && user.resetExpires && user.resetExpires > new Date();
    if (!isValid)
      throw new BadRequestException('Tempo para redefinição expirado.');
    user.password = await bcrypt.hash(newPass, 10);
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await this.userRepository.update(user);
  }

  async validateResetToken(email: string, code: string) {
    const user = await this.userRepository.findByEmail(email);

    const isValid =
      user &&
      user.resetToken === code &&
      user.resetExpires &&
      user.resetExpires > new Date();

    if (!isValid) {
      throw new BadRequestException('Código inválido ou expirado.');
    }

    return { valid: true };
  }

  async getAllUsers() {
    return this.userRepository.getAll();
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Not found');
    return user;
  }

  private generateToken(user: User) {
    const payload = { id: user.id, email: user.email };
    const secret =
      this.configService.get<string>('jwt.secret') || 'default_secret_key';
    return { token: jwt.sign(payload, secret, { expiresIn: '1d' }) };
  }
}
