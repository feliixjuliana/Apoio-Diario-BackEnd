import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { children } from '@prisma/client';

@Injectable()
export class ChildrenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: any): Promise<any> {
    const child = await this.prisma.children.create({
      data: {
        usuarioId: userId,
        nome: data.nome,
        dataNascimento: data.dataNascimento,
        genero: data.genero,
        condicao: data.condicao,
        nivelSuporte: data.nivelSuporte,
      },
    });

    return {
      ...child,
      idade: this.calculateAge(child.dataNascimento),
    };
  }

  async findByUserId(userId: string): Promise<any[]> {
    const child = await this.prisma.children.findMany({
      where: { usuarioId: userId },
      orderBy: { criadoEm: 'asc' },
    });

    if (!child) {
      return [];
    }

    return child.map((c) => ({
      ...c,
      idade: this.calculateAge(c.dataNascimento),
    }));
  }

  async findById(id: string): Promise<any | null> {
    const child = await this.prisma.children.findUnique({
      where: { id },
    });
    if (!child) {
      return null;
    }
    return {
      ...child,
      idade: this.calculateAge(child.dataNascimento),
    };
  }

  async update(id: string, data: any): Promise<any> {
    const child = await this.prisma.children.update({
      where: { id },
      data: {
        nome: data.nome,
        dataNascimento: data.dataNascimento
          ? new Date(data.dataNascimento)
          : undefined,
        genero: data.genero,
        condicao: data.condicao,
        nivelSuporte: data.nivelSuporte,
      },
    });

    return {
      ...child,
      idade: this.calculateAge(child.dataNascimento),
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.children.delete({
      where: { id },
    });
  }

  private calculateAge(date: Date): number {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      age--;
    }

    return age;
  }
}
