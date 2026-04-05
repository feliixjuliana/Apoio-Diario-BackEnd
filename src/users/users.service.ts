import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { users } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

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
    if (existingUser)
      throw new ConflictException({
        message: 'Dados Inválidos',
        errors: { email: 'E-mail já cadastrado' },
      });

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.userRepository.save({
      email: dto.email,
      senha: passwordHash,
      pinParental: dto.pinParental,
    });
  }

  async validateUserLogin(email: string, pass: string) {
    const user = await this.userRepository.findByEmail(email);
    const isValid =
      user && user.senha && (await bcrypt.compare(pass, user.senha));

    if (!isValid) throw new UnauthorizedException('E-mail ou senha inválidos.');

    return this.generateToken(user);
  }

  async loginWithGoogle(googleToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: googleToken,
      audience: this.configService.get<string>('google.clientId'),
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email)
      throw new UnauthorizedException('Token do Google inválido.');

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
    const emailHtml = this.buildForgotPasswordEmailTemplate(resetToken);
    const emailText = [
      'Apoio Diario',
      '',
      'Recebemos uma solicitacao para redefinir sua senha.',
      `Use o codigo: ${resetToken}`,
      '',
      'Esse codigo expira em 15 minutos.',
      'Se voce nao solicitou essa alteracao, ignore este e-mail.',
    ].join('\n');

    await this.userRepository.update(user.id, {
      tokenRecuperacao: resetToken,
      expiracaoRecuperacao: new Date(Date.now() + 900000),
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
      text: emailText,
      html: emailHtml,
    });
  }

  async resetPassword(email: string, newPass: string) {
    const user = await this.userRepository.findByEmail(email);
    const isValid =
      user &&
      user.expiracaoRecuperacao &&
      user.expiracaoRecuperacao > new Date();

    if (!isValid)
      throw new BadRequestException('Tempo para redefinição expirado.');

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

    if (user.pinParental !== Number(pin))
      throw new ForbiddenException('PIN Parental inválido.');

    return { valid: true };
  }

  async updateParentalControl(userId: string, enabled: boolean) {
    const user = await this.userRepository.findById(userId);

    if (!user) throw new NotFoundException('Usuário não encontrado.');

    return this.userRepository.update(userId, {
      controleParentalAtivo: enabled,
    });
  }

  async updateUser(userId: string, id: string, dto: UpdateUserDto) {
    if (userId !== id) {
      throw new ForbiddenException('Você só pode editar sua própria conta.');
    }

    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const data: any = {};

    if (dto.email) {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('E-mail já está em uso.');
      }
      data.email = dto.email;
    }

    if (dto.senha) {
      data.senha = await bcrypt.hash(dto.senha, 10);
    }

    if (dto.pinParental !== undefined) {
      data.pinParental = dto.pinParental;
    }

    return this.userRepository.update(id, data);
  }

  private generateToken(user: users) {
    const payload = { id: user.id, email: user.email };
    const secret =
      this.configService.get<string>('jwt.secret') || 'JubisDandanApoioDiario';
    return { token: jwt.sign(payload, secret, { expiresIn: '1d' }) };
  }

  private buildForgotPasswordEmailTemplate(resetToken: string): string {
    return `
      <div style="margin:0;padding:32px 16px;background:linear-gradient(180deg,#f4f7fb 0%,#eef2ff 100%);font-family:Arial,sans-serif;color:#1f2937;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;padding:40px 32px;box-shadow:0 20px 45px rgba(15,23,42,0.08);">
          <h1 style="margin:24px 0 12px;font-size:28px;line-height:1.2;color:#0f172a;">
            Recuperacao de senha
          </h1>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#475569;">
            Recebemos uma solicitacao para redefinir sua senha. Use o codigo abaixo para continuar com a recuperacao da conta.
          </p>
          <div style="margin:0 0 24px;padding:24px;border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0;text-align:center;">
            <div style="margin-bottom:10px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">
              Codigo de verificacao
            </div>
            <div style="font-size:36px;font-weight:700;letter-spacing:0.3em;color:#0f172a;">
              ${resetToken}
            </div>
          </div>
          <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#475569;">
            Esse codigo expira em <strong>15 minutos</strong>.
          </p>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#64748b;">
            Se voce nao solicitou essa alteracao, pode ignorar este e-mail com seguranca.
          </p>
        </div>
      </div>
    `;
  }
}
