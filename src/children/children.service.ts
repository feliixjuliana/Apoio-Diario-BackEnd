import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ChildrenRepository } from './children.repository';
import { Child } from './entities/child.entity';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';

@Injectable()
export class ChildrenService {
  constructor(private readonly repo: ChildrenRepository) {}

  async create(userId: string, dto: CreateChildDto): Promise<Child> {
    const child = new Child({ ...dto, userId });
    return this.repo.create(child);
  }

  async findAllByParent(userId: string): Promise<Child[]> {
    return this.repo.findByUserId(userId);
  }

  async findOne(id: string): Promise<Child> {
    const child = await this.repo.findById(id);
    if (!child) {
      throw new NotFoundException('Perfil da criança não encontrado');
    }
    return child;
  }

  async update(id: string, userId: string, data: UpdateChildDto): Promise<Child> {
    const child = await this.repo.findById(id);

    if (!child) {
      throw new NotFoundException('Perfil de criança não encontrado');
    }

    if (child.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para alterar este perfil');
    }

    return this.repo.update(id, data);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const child = await this.findOne(id);

    if (child.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para remover este perfil');
    }

    await this.repo.delete(id);
    return { message: 'Perfil removido com sucesso' };
  }
}