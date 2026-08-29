import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { RoutinesRepository } from './routines.repository';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { ReorderRoutinesDto } from './dto/reorder-routines.dto';
import { RoutineTemplatesRepository } from './routines-templates.repository';
import { PrismaService } from 'prisma/prisma.service';
import { parseDataCivil } from '../common/date/data-civil';
import {
  chaveDataTarefa,
  reconciliarPrioridadesDoDia,
} from './prioridade-routines';

@Injectable()
export class RoutinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: RoutinesRepository,
    private readonly templateRepository: RoutineTemplatesRepository,
  ) {}

  async create(userId: string, dto: CreateRoutineDto) {
    const child = await this.repository.findChildById(dto.childId);
    if (!child || child.usuarioId !== userId) {
      throw new ForbiddenException('Acesso negado à criança especificada.');
    }

    if (dto.salvarComoTemplate && !dto.dataTarefa) {
      return this.templateRepository.create({
        childId: dto.childId,
        nomeTarefa: dto.nomeTarefa,
        duracaoMinutos: dto.duracaoMinutos,
        imgTarefa: dto.imgTarefa,
        horarioInicio: dto.horarioInicio,
        subtarefas: dto.subtarefas?.map((sub) => ({
          nomeTarefa: sub.nomeTarefa,
          imgTarefa: sub.imgTarefa,
        })),
      });
    }

    const createdRoutine = await this.repository.create(dto);

    if (dto.salvarComoTemplate) {
      await this.templateRepository.create({
        childId: dto.childId,
        nomeTarefa: dto.nomeTarefa,
        duracaoMinutos: dto.duracaoMinutos,
        imgTarefa: dto.imgTarefa,
        horarioInicio: dto.horarioInicio,
        subtarefas: dto.subtarefas?.map((sub) => ({
          nomeTarefa: sub.nomeTarefa,
          imgTarefa: sub.imgTarefa,
        })),
      });
    }

    return createdRoutine;
  }

  async reorder(userId: string, dto: ReorderRoutinesDto) {
    const items = [...dto.items].sort((a, b) => a.prioridade - b.prioridade);
    const ids = items.map((item) => item.id);
    const prioridades = items.map((item) => item.prioridade);

    if (
      !items.length ||
      new Set(ids).size !== ids.length ||
      new Set(prioridades).size !== prioridades.length ||
      prioridades.some((prioridade, index) => prioridade !== index + 1)
    ) {
      throw new BadRequestException(
        'A reordenação deve conter uma sequência completa de prioridades.',
      );
    }

    const rotinas = await this.repository.findManyByIds(ids);
    if (
      rotinas.length !== ids.length ||
      rotinas.some((rotina) => rotina.crianca.usuarioId !== userId)
    ) {
      throw new ForbiddenException('Acesso negado a uma ou mais atividades.');
    }

    const childId = rotinas[0].childId;
    const dataTarefa = rotinas[0].dataTarefa;
    if (
      !dataTarefa ||
      rotinas.some(
        (rotina) =>
          rotina.childId !== childId ||
          !rotina.dataTarefa ||
          chaveDataTarefa(rotina.dataTarefa) !== chaveDataTarefa(dataTarefa),
      )
    ) {
      throw new BadRequestException(
        'Todas as atividades devem pertencer à mesma criança e data.',
      );
    }

    const rotinasDoDia = await this.repository.findByChildAndDate(
      childId,
      chaveDataTarefa(dataTarefa),
    );
    const idsDoDia = new Set(rotinasDoDia.map((rotina) => rotina.id));
    if (idsDoDia.size !== ids.length || ids.some((id) => !idsDoDia.has(id))) {
      throw new BadRequestException(
        'A reordenação deve incluir todas as atividades da data.',
      );
    }

    const porId = new Map(rotinas.map((rotina) => [rotina.id, rotina]));
    const ordemComHorarioAnterior = [...rotinas]
      .filter((rotina) => rotina.horarioInicio !== null)
      .sort((a, b) => a.prioridade - b.prioridade || a.id.localeCompare(b.id))
      .map((rotina) => rotina.id);
    const ordemComHorarioSolicitada = items
      .map((item) => porId.get(item.id)!)
      .filter((rotina) => rotina.horarioInicio !== null)
      .map((rotina) => rotina.id);

    if (
      ordemComHorarioAnterior.some(
        (id, index) => id !== ordemComHorarioSolicitada[index],
      )
    ) {
      throw new BadRequestException(
        'Atividades com horário devem manter sua ordem relativa.',
      );
    }

    return this.repository.reorder(items);
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

  async createFromTemplate(templateId: string, userId: string) {
    const template = await this.templateRepository.findById(templateId);

    if (!template) {
      throw new NotFoundException('Template não encontrado.');
    }

    const child = await this.repository.findChildById(template.childId);

    if (!child || child.usuarioId !== userId) {
      throw new ForbiddenException('Acesso negado.');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const dto: CreateRoutineDto = {
      childId: template.childId,
      nomeTarefa: template.nomeTarefa,
      duracaoMinutos: template.duracaoMinutos ?? undefined,
      imgTarefa: template.imgTarefa ?? undefined,
      horarioInicio: template.horarioInicio,
      dataTarefa: today.toISOString(),
      subtarefas: template.subtarefas.map((sub) => ({
        nomeTarefa: sub.nomeTarefa,
        imgTarefa: sub.imgTarefa ?? undefined,
      })),
    };

    return this.repository.create(dto);
  }

  private startOfDay(date: Date) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
      0,
    );
  }

  private endOfDay(date: Date) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999,
    );
  }

  private toWeekday1to7(date: Date) {
    return date.getDay() + 1;
  }

  async ensureRecurrencesForDate(
    userId: string,
    childId: string,
    dateISO: string,
  ) {
    const child = await this.repository.findChildById(childId);
    if (!child || child.usuarioId !== userId) {
      throw new ForbiddenException('Acesso negado.');
    }

    const onlyDate = dateISO.split('T')[0];
    const [year, month, day] = onlyDate.split('-').map(Number);

    const target = new Date(year, month - 1, day);
    const targetCivilDate = parseDataCivil(onlyDate);

    const targetStart = this.startOfDay(target);

    const todayStart = this.startOfDay(new Date());
    if (targetStart < todayStart) return;

    const targetEnd = this.endOfDay(target);

    const weekday = this.toWeekday1to7(targetStart);

    const rules = await this.prisma.routine_recurrence_rule.findMany({
      where: {
        childId,
        ativo: true,
        diasSemana: { has: weekday },
        OR: [{ dataInicio: null }, { dataInicio: { lte: targetCivilDate } }],
      },
      include: { subtarefas: { orderBy: { ordem: 'asc' } } },
    });

    const eligibleRules = rules.filter(
      (rule) => rule.dataInicio === null || rule.dataInicio <= targetCivilDate,
    );

    if (!eligibleRules.length) return;

    const existing = await this.prisma.routine.findMany({
      where: {
        childId,
        dataTarefa: { gte: targetStart, lte: targetEnd },
      },
      select: { id: true, recurrenceRuleId: true, prioridade: true },
    });

    const existingRuleIds = new Set(
      existing.map((r) => r.recurrenceRuleId).filter(Boolean) as string[],
    );
    let nextPriority =
      existing.reduce((max, r) => Math.max(max, r.prioridade), 0) + 1;

    const toCreate = eligibleRules.filter(
      (rule) => !existingRuleIds.has(rule.id),
    );

    if (!toCreate.length) return;

    await this.prisma.$transaction(async (tx) => {
      for (const rule of toCreate) {
        await tx.routine.create({
          data: {
            childId: rule.childId,
            nomeTarefa: rule.nomeTarefa,
            duracaoMinutos: rule.duracaoMinutos ?? undefined,
            imgTarefa: rule.imgTarefa,
            horarioInicio: rule.horarioInicio,
            dataTarefa: targetStart,
            prioridade: nextPriority++,
            tarefaCompletada: false,
            recurrenceRuleId: rule.id,
            subtarefas: {
              create: rule.subtarefas.map((s, index) => ({
                nomeTarefa: s.nomeTarefa,
                imgTarefa: s.imgTarefa,
                ordem: index,
              })),
            },
          },
        });
      }

      await reconciliarPrioridadesDoDia(tx, childId, targetStart);
    });
  }

  async findAllByChildAndDate(
    childId: string,
    dateISO: string,
    userId: string,
  ) {
    const child = await this.repository.findChildById(childId);
    if (!child || child.usuarioId !== userId) {
      throw new ForbiddenException('Acesso negado.');
    }
    await this.ensureRecurrencesForDate(userId, childId, dateISO);

    return this.repository.findByChildAndDate(childId, dateISO);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.repository.delete(id);
    return { message: 'Rotina e subtarefas removidas com sucesso' };
  }
}
