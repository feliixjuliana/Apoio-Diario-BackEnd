import { Injectable, NotFoundException } from '@nestjs/common';
import { ChildrenRepository } from './children.repository';
import { Child } from './entities/child.entity';

@Injectable()
export class ChildrenService {
  constructor(private readonly repo: ChildrenRepository) {}

  async create(userId: string, data: any): Promise<Child> {
    const child = new Child({ ...data, userId });
    return this.repo.create(child);
  }

  async findAllByParent(userId: string): Promise<Child[]> {
    return this.repo.findByUserId(userId);
  }

  async findOne(id: string): Promise<Child> {
    const child = await this.repo.findById(id);
    if (!child) throw new NotFoundException('Perfil da criança não encontrado');
    return child;
  }

  async update(id: string, userId: string, data: any): Promise<Child> {
    const child = await this.findOne(id);
    await this.repo.update(id, data);
    return { ...child, ...data };
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.repo.delete(id);
    return { message: 'Perfil removido com sucesso' };
  }
}