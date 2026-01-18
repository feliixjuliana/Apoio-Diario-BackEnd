import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';

@Injectable()
export class RoutinesRepository {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoutineDto) {
    const { subtarefas, ...data } = dto;
    return this.prisma.routine.create({
      data: {
        ...data,
        dataTarefa: new Date(dto.dataTarefa),
        subtarefas: {
          create: subtarefas?.map(sub => ({
            nomeTarefa: sub.nomeTarefa,
            imgTarefa: sub.imgTarefa,
            tarefaCompletada: sub.tarefaCompletada ?? false,
          })),
        },
      },
      include: { subtarefas: true },
    });
  }

  async findById(id: string) {
    return this.prisma.routine.findUnique({
      where: { id },
      include: { 
        subtarefas: true,
        crianca: true 
      },
    });
  }

  async findByChild(childId: string) {
    return this.prisma.routine.findMany({
      where: { childId },
      include: { subtarefas: true },
      orderBy: { prioridade: 'asc' },
    });
  }

  async update(id: string, dto: UpdateRoutineDto) {
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

  async delete(id: string) {
    return this.prisma.routine.delete({
      where: { id },
    });
  }

  async findChildById(id: string) {
    return this.prisma.children.findUnique({
      where: { id },
    });
  }
}