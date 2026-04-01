import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { routine_template } from '@prisma/client';
import { CreateRoutineTemplateDto } from './dto/create-routine-template.dto';
import { UpdateRoutineTemplateDto } from './dto/update-routine-template.dto';

@Injectable()
export class RoutineTemplatesRepository {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoutineTemplateDto): Promise<routine_template> {
    const { subtarefas, ...data } = dto;

    return this.prisma.routine_template.create({
      data: {
        ...data,
        subtarefas: {
          create: subtarefas?.map((sub, index) => ({
            nomeTarefa: sub.nomeTarefa,
            imgTarefa: sub.imgTarefa,
            ordem: index,
          })),
        },
      },
      include: { subtarefas: { orderBy: { ordem: 'asc' } } },
    });
  }

  async findByChild(childId: string) {
    return this.prisma.routine_template.findMany({
      where: { childId },
      include: { subtarefas: { orderBy: { ordem: 'asc' } } },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.routine_template.findUnique({
      where: { id },
      include: { subtarefas: { orderBy: { ordem: 'asc' } }, crianca: true },
    });
  }

  async updateTemplateTransaction(id: string, dto: UpdateRoutineTemplateDto) {
    const { subtarefas, ...data } = dto;

    return this.prisma.$transaction(async (tx) => {
      await tx.routine_template.update({
        where: { id },
        data,
      });

      await tx.template_subtask.deleteMany({
        where: { templateId: id },
      });

      if (subtarefas?.length) {
        await tx.template_subtask.createMany({
          data: subtarefas.map((s, index) => ({
            templateId: id,
            nomeTarefa: s.nomeTarefa,
            imgTarefa: s.imgTarefa,
            ordem: index,
          })),
        });
      }

      return tx.routine_template.findUnique({
        where: { id },
        include: { subtarefas: { orderBy: { ordem: 'asc' } } },
      });
    });
  }

  async delete(id: string) {
    return this.prisma.routine_template.delete({
      where: { id },
    });
  }
}
