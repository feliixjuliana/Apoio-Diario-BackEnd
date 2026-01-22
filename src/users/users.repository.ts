import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { users } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: any): Promise<users> {
    return this.prisma.users.create({
      data: {
        email: data.email,
        senha: data.senha,
        pinParental: data.pinParental,
      },
    });
  }

  async update(id: string, data: any): Promise<users> {
    return this.prisma.users.update({
      where: { id },
      data: {
        senha: data.senha,
        pinParental: data.pinParental,
        tokenRecuperacao: data.tokenRecuperacao,
        expiracaoRecuperacao: data.expiracaoRecuperacao,
      },
    });
  }

  async findByEmail(email: string): Promise<users | null> {
    return this.prisma.users.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.users.findUnique({
      where: { id },
      include: {
        criancas: true,
      },
    });
  }

  async getAll() {
    return this.prisma.users.findMany({
      include: {
        criancas: true,
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.users.delete({
      where: { id },
    });
  }
}