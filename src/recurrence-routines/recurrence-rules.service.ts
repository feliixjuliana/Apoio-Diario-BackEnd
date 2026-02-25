import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RecurrenceRulesRepository } from './recurrence-rules.repository';
import { CreateRecurrenceRuleDto } from './dto/create-recurrence-rule.dto';
import { RoutinesRepository } from 'src/routines/routines.repository';

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

  async remove(userId: string, id: string) {
    const rule = await this.rulesRepo.findById(id);
    if (!rule) throw new NotFoundException('Regra não encontrada.');

    if (rule.crianca.usuarioId !== userId) {
      throw new ForbiddenException('Acesso negado.');
    }
    await this.rulesRepo.delete(id);
    return { message: 'Regra removida com sucesso' };
  }
}
