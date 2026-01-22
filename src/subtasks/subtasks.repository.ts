import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { subtask } from '@prisma/client';
import { CreateSubtaskDto } from './dto/create-subtask.dto';

@Injectable()
export class SubtasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSubtaskDto): Promise<subtask> {
    return this.prisma.subtask.create({
      data: {
        routineId: dto.routineId,
        nomeTarefa: dto.nomeTarefa,
        imgTarefa: dto.imgTarefa,
        tarefaCompletada: dto.tarefaCompletada ?? false,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.subtask.findUnique({
      where: { id },
      include: {
        rotinaMae: {
          include: { crianca: true }
        }
      }
    });
  }

  async update(id: string, data: any): Promise<subtask> {
    return this.prisma.subtask.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.subtask.delete({
      where: { id },
    });
  }

  async findRoutineOwner(routineId: string) {
    return this.prisma.routine.findUnique({
      where: { id: routineId },
      include: { crianca: true }
    });
  }
}