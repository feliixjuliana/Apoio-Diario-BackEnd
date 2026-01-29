import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { routine } from '@prisma/client';

@Injectable()
export class RoutinesRepository {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoutineDto): Promise<routine> {
    const { subtarefas, ...data } = dto;
    const date = new Date(dto.dataTarefa);

    const lastRoutine = await this.prisma.routine.findFirst({
      where: {
        childId: dto.childId,
        dataTarefa: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lte: new Date(date.setHours(23, 59, 59, 999)),
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
      include: { subtarefas: true, crianca: true },
    });
  }

  async findChildById(id: string) {
    return this.prisma.children.findUnique({ where: { id } });
  }

  async findByChild(childId: string) {
    return this.prisma.routine.findMany({
      where: { childId },
      include: { subtarefas: true },
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
      include: { subtarefas: true },
    });
  }

  async delete(id: string): Promise<routine> {
    return this.prisma.routine.delete({ where: { id } });
  }
}