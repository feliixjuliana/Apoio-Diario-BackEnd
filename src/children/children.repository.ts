import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { children } from '@prisma/client';

@Injectable()
export class ChildrenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: any): Promise<children> {
    return this.prisma.children.create({
      data: {
        usuarioId: userId,
        nome: data.nome,
        idade: data.idade,
        sonsAtivos: data.sonsAtivos,
        vibracaoAtiva: data.vibracaoAtiva,
        animacoesAtivas: data.animacoesAtivas,
      },
    });
  }

  async findByUserId(userId: string): Promise<children[]> {
    return this.prisma.children.findMany({
      where: { usuarioId: userId },
      orderBy: { criadoEm: 'asc' },
    });
  }

  async findById(id: string): Promise<children | null> {
    return this.prisma.children.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: any): Promise<children> {
    return this.prisma.children.update({
      where: { id },
      data: {
        nome: data.nome,
        idade: data.idade,
        sonsAtivos: data.sonsAtivos,
        vibracaoAtiva: data.vibracaoAtiva,
        animacoesAtivas: data.animacoesAtivas,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.children.delete({
      where: { id },
    });
  }
}