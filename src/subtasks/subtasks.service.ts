import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SubtasksRepository } from './subtasks.repository';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class SubtasksService {
  constructor(private readonly repo: SubtasksRepository) {}

  async update(id: string, userId: string, dto: UpdateSubtaskDto) {
    const subtask = await this.repo.findById(id);
    if (!subtask) throw new NotFoundException('Subtarefa não encontrada');

    if (subtask.rotinaMae.crianca.usuarioId !== userId) {
      throw new ForbiddenException('Acesso negado a esta subtarefa');
    }

    return this.repo.update(id, dto);
  }

  async remove(id: string, userId: string) {
    const subtask = await this.repo.findById(id);
    if (!subtask) throw new NotFoundException('Subtarefa não encontrada');

    if (subtask.rotinaMae.crianca.usuarioId !== userId) {
      throw new ForbiddenException('Acesso negado');
    }

    await this.repo.delete(id);
    return { message: 'Passo removido com sucesso' };
  }
}