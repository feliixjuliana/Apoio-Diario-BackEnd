import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RecurrenceRulesRepository } from './recurrence-rules.repository';
import { CreateRecurrenceRuleDto } from './dto/create-recurrence-rule.dto';
import { RoutinesRepository } from 'src/routines/routines.repository';
import { UpdateRecurrenceRuleDto } from './dto/update-recurrence-rule.dto';

@Injectable()
export class RecurrenceRulesService {
  constructor(
    private readonly routinesRepo: RoutinesRepository,
    private readonly rulesRepo: RecurrenceRulesRepository,
  ) {}

  async create(userId: string, dto: CreateRecurrenceRuleDto) {
    const child = await this.routinesRepo.findChildById(dto.childId);
    if (!child || child.usuarioId !== userId) {
      throw new ForbiddenException('Acesso negado à criança especificada.');
    }
    return this.rulesRepo.create(dto);
  }

  async listByChild(userId: string, childId: string) {
    const child = await this.routinesRepo.findChildById(childId);
    if (!child || child.usuarioId !== userId) {
      throw new ForbiddenException('Acesso negado.');
    }
    return this.rulesRepo.findByChild(childId);
  }

  async update(userId: string, id: string, dto: UpdateRecurrenceRuleDto) {
    const rule = await this.rulesRepo.findById(id);
    if (!rule) {
      throw new NotFoundException('Regra não encontrada.');
    }

    if (rule.crianca.usuarioId !== userId) {
      throw new ForbiddenException('Acesso negado.');
    }

    const updatedRule = await this.rulesRepo.updateRuleTransaction(id, dto);

    if (!updatedRule)
      throw new NotFoundException('Regra não encontrada para atualização.');

    const todayRoutine = await this.routinesRepo.findTodayByRule(id);

    if (todayRoutine && !todayRoutine.tarefaCompletada) {
      await this.routinesRepo.update(todayRoutine.id, {
        nomeTarefa: updatedRule.nomeTarefa,
        imgTarefa: updatedRule.imgTarefa,
        duracaoMinutos: updatedRule.duracaoMinutos ?? undefined,
      });

      await this.routinesRepo.replaceSubtasks(
        todayRoutine.id,
        updatedRule.subtarefas,
      );
    }

    return updatedRule;
  }

  async remove(
    userId: string,
    id: string,
    deleteMode: 'future' | 'all' = 'future',
  ) {
    const rule = await this.rulesRepo.findById(id);
    if (!rule) {
      throw new NotFoundException('Regra não encontrada.');
    }

    if (rule.crianca.usuarioId !== userId) {
      throw new ForbiddenException('Acesso negado.');
    }
    await this.rulesRepo.deleteRecurrence(id, deleteMode);
  }
}
