import { Injectable } from '@nestjs/common';
import { CreateRecurrenceRuleDto } from '../recurrence-routines/dto/create-recurrence-rule.dto';
import { PrismaService } from 'prisma/prisma.service';

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

  delete(id: string) {
    return this.prisma.routine_recurrence_rule.delete({ where: { id } });
  }
}
