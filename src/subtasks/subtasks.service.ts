import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SubtasksRepository } from './subtasks.repository';
import { CreateSubtaskDto } from './dto/create-subtask.dto';

@Injectable()
export class SubtasksService {
  constructor(private readonly repo: SubtasksRepository) {}

  async create(userId: string, dto: CreateSubtaskDto) {
    const routine = await this.repo.findRoutineOwner(dto.routineId);
    if (!routine) throw new NotFoundException('Rotina mãe não encontrada');
    if (routine.crianca.usuarioId !== userId) throw new ForbiddenException();

    return this.repo.create(dto);
  }

  async toggleStatus(id: string, userId: string, completed: boolean) {
    const subtask = await this.repo.findById(id);
    if (!subtask) throw new NotFoundException('Subtarefa não encontrada');
    if (subtask.rotinaMae.crianca.usuarioId !== userId) throw new ForbiddenException();

    return this.repo.update(id, { tarefaCompletada: completed });
  }

  async remove(id: string, userId: string) {
    const subtask = await this.repo.findById(id);
    if (!subtask) throw new NotFoundException('Subtarefa não encontrada');
    if (subtask.rotinaMae.crianca.usuarioId !== userId) throw new ForbiddenException();

    return this.repo.delete(id);
  }
}