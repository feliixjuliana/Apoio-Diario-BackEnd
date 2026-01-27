import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { users } from '@prisma/client';

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

  async registerUser(dto: CreateUserDto): Promise<users> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) throw new ConflictException({ message: 'Dados Inválidos', errors: { email: 'Email ja cadastrado' }});

    const passwordHash = await bcrypt.hash(dto.password, 10);
    
    return this.userRepository.save({ 
      email: dto.email, 
      senha: passwordHash,
      pinParental: dto.pinParental
    });
  }

  async validateUserLogin(email: string, pass: string) {
    const user = await this.userRepository.findByEmail(email);
    const isValid = user && user.senha && (await bcrypt.compare(pass, user.senha));
    
    if (!isValid) throw new UnauthorizedException('Email ou senha inválidos.');
    
    return this.generateToken(user);
  }

  async loginWithGoogle(googleToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: googleToken,
      audience: this.configService.get<string>('google.clientId'),
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw new UnauthorizedException('Token do Google inválido.');

    let user = await this.userRepository.findByEmail(payload.email);
    if (!user) {
      user = await this.userRepository.save({ email: payload.email });
    }
    return this.generateToken(user);
  }

  async sendForgotPasswordEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const resetToken = crypto.randomInt(100000, 999999).toString();
    
    await this.userRepository.update(user.id, {
      tokenRecuperacao: resetToken,
      expiracaoRecuperacao: new Date(Date.now() + 900000), // 15 minutos
    });

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
      subject: 'Código de Recuperação - Apoio Diário',
      text: `Seu código de recuperação é: ${resetToken}`,
    });
  }

  async resetPassword(email: string, newPass: string) {
    const user = await this.userRepository.findByEmail(email);
    const isValid = user && user.expiracaoRecuperacao && user.expiracaoRecuperacao > new Date();
    
    if (!isValid) throw new BadRequestException('Tempo para redefinição expirado.');

    const passwordHash = await bcrypt.hash(newPass, 10);
    
    await this.userRepository.update(user.id, {
      senha: passwordHash,
      tokenRecuperacao: null,
      expiracaoRecuperacao: null,
    });
  }

  async validateResetToken(email: string, code: string) {
    const user = await this.userRepository.findByEmail(email);

    const isValid =
      user &&
      user.tokenRecuperacao === code &&
      user.expiracaoRecuperacao &&
      user.expiracaoRecuperacao > new Date();

    if (!isValid) throw new BadRequestException('Código inválido ou expirado.');

    return { valid: true };
  }

  async getAllUsers() {
    return this.userRepository.getAll();
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  async validatePin(userId: string, pin: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    
    if (user.pinParental !== pin) throw new UnauthorizedException('PIN Parental inválido.');
    
    return { valid: true };
  }

  private generateToken(user: users) {
    const payload = { id: user.id, email: user.email };
    const secret = this.configService.get<string>('jwt.secret') || 'JubisDandanApoioDiario';
    return { token: jwt.sign(payload, secret, { expiresIn: '1d' }) };
  }
}