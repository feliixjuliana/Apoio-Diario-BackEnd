import {
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
        subtarefas: dto.subtarefas?.map((sub) => ({
          nomeTarefa: sub.nomeTarefa,
          imgTarefa: sub.imgTarefa,
        })),
      });
    }

    return createdRoutine;
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
      },
      include: { subtarefas: { orderBy: { ordem: 'asc' } } },
    });

    if (!rules.length) return;

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

    const toCreate = rules.filter((rule) => !existingRuleIds.has(rule.id));

    if (!toCreate.length) return;

    await this.prisma.$transaction(
      toCreate.map((rule) =>
        this.prisma.routine.create({
          data: {
            childId: rule.childId,
            nomeTarefa: rule.nomeTarefa,
            duracaoMinutos: rule.duracaoMinutos ?? undefined,
            imgTarefa: rule.imgTarefa,
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
        }),
      ),
    );
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
