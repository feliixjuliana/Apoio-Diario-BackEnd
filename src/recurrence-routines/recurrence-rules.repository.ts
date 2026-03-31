import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecurrenceRuleDto } from '../recurrence-routines/dto/create-recurrence-rule.dto';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateRecurrenceRuleDto } from './dto/update-recurrence-rule.dto';

@Injectable()
export class RecurrenceRulesRepository {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateRecurrenceRuleDto) {
    const { subtarefas, ...data } = dto;

    return this.prisma.routine_recurrence_rule.create({
      data: {
        ...data,
        subtarefas: {
          create: subtarefas?.map((s) => ({
            nomeTarefa: s.nomeTarefa,
            imgTarefa: s.imgTarefa,
          })),
        },
      },
      include: { subtarefas: true },
    });
  }

  findByChild(childId: string) {
    return this.prisma.routine_recurrence_rule.findMany({
      where: { childId, ativo: true },
      include: { subtarefas: true },
      orderBy: { criadoEm: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.routine_recurrence_rule.findUnique({
      where: { id },
      include: { subtarefas: true, crianca: true },
    });
  }

  async updateRuleTransaction(id: string, dto: UpdateRecurrenceRuleDto) {
    const { subtarefas, ...data } = dto;

    return this.prisma.$transaction(async (tx) => {
      await tx.routine_recurrence_rule.update({
        where: { id },
        data: {
          ...data,
        },
      });

      await tx.recurrence_subtask.deleteMany({
        where: { ruleId: id },
      });

      if (subtarefas?.length) {
        await tx.recurrence_subtask.createMany({
          data: subtarefas.map((s) => ({
            ruleId: id,
            nomeTarefa: s.nomeTarefa,
            imgTarefa: s.imgTarefa,
          })),
        });
      }

      return tx.routine_recurrence_rule.findUnique({
        where: { id },
        include: { subtarefas: true },
      });
    });
  }

  async deleteRecurrence(id: string, deleteMode: 'future' | 'all') {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    if (deleteMode === 'future') {
      await this.prisma.routine.deleteMany({
        where: {
          recurrenceRuleId: id,
          dataTarefa: {
            gt: todayStart,
          },
        },
      });
    }

    if (deleteMode === 'all') {
      await this.prisma.routine.deleteMany({
        where: {
          recurrenceRuleId: id,
        },
      });
    }

    await this.prisma.routine_recurrence_rule.delete({
      where: { id },
    });

    return { message: 'Recorrência removida com sucesso' };
  }
}
