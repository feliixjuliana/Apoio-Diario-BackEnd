import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RoutinesRepository } from './routines.repository';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { ReorderRoutinesDto } from './dto/reorder-routines.dto';

@Injectable()
export class RoutinesService {
  constructor(private readonly repository: RoutinesRepository) {}

  async create(userId: string, dto: CreateRoutineDto) {
    const child = await this.repository.findChildById(dto.childId);
    if (!child || child.usuarioId !== userId) {
      throw new ForbiddenException('Acesso negado à criança especificada.');
    }
    return this.repository.create(dto);
  }

  async reorder(userId: string, dto: ReorderRoutinesDto) {
    const firstItem = await this.repository.findById(dto.items[0].id);
    if (!firstItem || firstItem.crianca.usuarioId !== userId) {
      throw new ForbiddenException();
    }
    return this.repository.reorder(dto.items);
  }

  async findAllByChild(childId: string, userId: string) {
    const child = await this.repository.findChildById(childId);
    if (!child || child.usuarioId !== userId) {
      throw new ForbiddenException('Acesso negado.');
    }
    return this.repository.findByChild(childId);
  }

  async findOne(id: string, userId: string) {
    const routine = await this.repository.findById(id);
    if (!routine) throw new NotFoundException('Tarefa não encontrada.');
    
    if (routine.crianca.usuarioId !== userId) {
      throw new ForbiddenException('Acesso negado.');
    }
    return routine;
  }

  async update(id: string, userId: string, dto: UpdateRoutineDto) {
    await this.findOne(id, userId); 
    return this.repository.update(id, dto);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.repository.delete(id);
    return { message: 'Rotina e subtarefas removidas com sucesso' };
  }
}