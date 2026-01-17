import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from './entities/user.entity';
import { UserWithChildren } from './dto/user-response.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<User> {
    const newUser = await this.prisma.users.create({
      data: {
        id: user.id,
        email: user.email,
        senha: user.password,
        pinParental: user.pinParental,
        criadoEm: user.createdAt,
      },
    });
    return this.mapToUserEntity(newUser);
  }

  async update(user: User): Promise<User> {
    const updated = await this.prisma.users.update({
      where: { id: user.id },
      data: {
        senha: user.password,
        pinParental: user.pinParental,
        tokenRecuperacao: user.resetToken,
        expiracaoRecuperacao: user.resetExpires,
      },
    });
    return this.mapToUserEntity(updated);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });
    return user ? this.mapToUserEntity(user) : null;
  }

  async findById(id: string): Promise<UserWithChildren | null> {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        criancas: true,
      },
    });

    if (!user) return null;
    return this.mapToModelWithChildren(user);
  }

  async getAll(): Promise<UserWithChildren[]> {
    const users = await this.prisma.users.findMany({
      include: {
        criancas: true,
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });
    return users.map((u) => this.mapToModelWithChildren(u));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.users.delete({
      where: { id },
    });
  }

  private mapToUserEntity(prismaUser: any): User {
    return new User({
      id: prismaUser.id,
      email: prismaUser.email,
      password: prismaUser.senha,
      pinParental: prismaUser.pinParental,
      createdAt: prismaUser.criadoEm,
      resetToken: prismaUser.tokenRecuperacao,
      resetExpires: prismaUser.expiracaoRecuperacao,
    });
  }

  private mapToModelWithChildren(row: any): UserWithChildren {
    return {
      id: row.id,
      email: row.email,
      pinParental: row.pinParental,
      createdAt: row.criadoEm,
      resetToken: row.tokenRecuperacao,
      resetExpires: row.expiracaoRecuperacao,
      children: row.criancas.map((c: any) => ({
        id: c.id,
        nome: c.nome,
        idade: c.idade,
        sonsAtivos: c.sonsAtivos,
        vibracaoAtiva: c.vibracaoAtiva,
        animacoesAtivas: c.animacoesAtivas,
        createdAt: c.criadoEm,
      })),
    };
  }
}