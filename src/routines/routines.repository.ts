import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { routine } from '@prisma/client';

@Injectable()
export class RoutinesRepository {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoutineDto): Promise<routine> {
    const { subtarefas, salvarComoTemplate, ...data } = dto;
    const onlyDate = dto.dataTarefa.split('T')[0];

    const start = new Date(`${onlyDate}T00:00:00.000Z`);
    const end = new Date(`${onlyDate}T23:59:59.999Z`);

    const lastRoutine = await this.prisma.routine.findFirst({
      where: {
        childId: dto.childId,
        dataTarefa: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { prioridade: 'desc' },
    });

    const nextPriority = lastRoutine ? lastRoutine.prioridade + 1 : 1;

    return this.prisma.routine.create({
      data: {
        ...data,
        prioridade: nextPriority,
        dataTarefa: new Date(dto.dataTarefa),
        subtarefas: {
          create: subtarefas?.map((sub) => ({
            nomeTarefa: sub.nomeTarefa,
            imgTarefa: sub.imgTarefa,
          })),
        },
      },
      include: { subtarefas: true },
    });
  }

  async reorder(items: { id: string; prioridade: number }[]) {
    return this.prisma.$transaction(
      items.map((item) =>
        this.prisma.routine.update({
          where: { id: item.id },
          data: { prioridade: item.prioridade },
        }),
      ),
    );
  }

  async findById(id: string) {
    return this.prisma.routine.findUnique({
      where: { id },
      include: {
        subtarefas: { orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }] },
        crianca: true,
      },
    });
  }

  async findChildById(id: string) {
    return this.prisma.children.findUnique({ where: { id } });
  }

  async findByChild(childId: string) {
    return this.prisma.routine.findMany({
      where: { childId },
      include: {
        subtarefas: { orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }] },
      },
      orderBy: { prioridade: 'asc' },
    });
  }

  async findByChildAndDate(childId: string, dateISO: string) {
    const onlyDate = dateISO.split('T')[0];
    const start = new Date(`${onlyDate}T00:00:00.000Z`);
    const end = new Date(`${onlyDate}T23:59:59.999Z`);

    return this.prisma.routine.findMany({
      where: {
        childId,
        dataTarefa: { gte: start, lte: end },
      },
      include: {
        subtarefas: { orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }] },
      },
      orderBy: { prioridade: 'asc' },
    });
  }

  async update(id: string, dto: UpdateRoutineDto): Promise<routine> {
    const { subtarefas, ...data } = dto;

    return this.prisma.routine.update({
      where: { id },
      data: {
        ...data,
        dataTarefa: dto.dataTarefa ? new Date(dto.dataTarefa) : undefined,
      },
      include: {
        subtarefas: { orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }] },
      },
    });
  }

  async findTodayByRule(ruleId: string) {
    const now = new Date();
    const start = new Date(now.toISOString().split('T')[0] + 'T00:00:00.000Z');
    const end = new Date(now.toISOString().split('T')[0] + 'T23:59:59.999Z');

    return this.prisma.routine.findFirst({
      where: {
        recurrenceRuleId: ruleId,
        dataTarefa: {
          gte: start,
          lte: end,
        },
      },
      include: {
        subtarefas: true,
      },
    });
  }

  async replaceSubtasks(routineId: string, subtasks: any[]) {
    await this.prisma.$transaction(async (tx) => {
      await tx.subtask.deleteMany({
        where: { routineId },
      });

      if (subtasks?.length) {
        await tx.subtask.createMany({
          data: subtasks.map((s) => ({
            routineId,
            nomeTarefa: s.nomeTarefa,
            imgTarefa: s.imgTarefa,
          })),
        });
      }
    });
  }

  async delete(id: string): Promise<routine> {
    return this.prisma.routine.delete({ where: { id } });
  }
}
