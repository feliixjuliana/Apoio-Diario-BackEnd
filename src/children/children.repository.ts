import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Child } from './entities/child.entity';

@Injectable()
export class ChildrenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(child: Child): Promise<Child> {
    const newChild = await this.prisma.children.create({
      data: {
        id: child.id,
        usuarioId: child.userId,
        nome: child.nome,
        idade: child.idade,
        sonsAtivos: child.sonsAtivos,
        vibracaoAtiva: child.vibracaoAtiva,
        animacoesAtivas: child.animacoesAtivas,
        criadoEm: child.createdAt,
      },
    });
    return this.mapToEntity(newChild);
  }

  async findByUserId(userId: string): Promise<Child[]> {
    const childrenList = await this.prisma.children.findMany({
      where: { usuarioId: userId },
      orderBy: { criadoEm: 'asc' },
    });
    return childrenList.map((row) => this.mapToEntity(row));
  }

  async findById(id: string): Promise<Child | null> {
    const child = await this.prisma.children.findUnique({
      where: { id },
    });
    return child ? this.mapToEntity(child) : null;
  }

  async update(id: string, data: Partial<Child>): Promise<Child> {
    const updated = await this.prisma.children.update({
      where: { id },
      data: {
        nome: data.nome,
        idade: data.idade,
        sonsAtivos: data.sonsAtivos,
        vibracaoAtiva: data.vibracaoAtiva,
        animacoesAtivas: data.animacoesAtivas,
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.children.delete({
      where: { id },
    });
  }

  private mapToEntity(row: any): Child {
    return new Child({
      id: row.id,
      userId: row.usuarioId,
      nome: row.nome,
      idade: row.idade,
      sonsAtivos: row.sonsAtivos,
      vibracaoAtiva: row.vibracaoAtiva,
      animacoesAtivas: row.animacoes_ativas,
      createdAt: row.criadoEm,
    });
  }
}
