import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { routine } from '@prisma/client';

@Injectable()
export class RoutinesRepository {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoutineDto): Promise<routine> {
    return this.prisma.routine.create({
      data: {
        ...dto,
        dataTarefa: new Date(dto.dataTarefa),
      },
    });
  }

  async findByChild(childId: string): Promise<any[]> {
    return this.prisma.routine.findMany({
      where: { childId },
      include: { subtarefas: true },
      orderBy: { horarioInicio: 'asc' }, 
    });
  }

  async findById(id: string) {
    return this.prisma.routine.findUnique({
      where: { id },
      include: { subtarefas: true, crianca: true },
    });
  }

  async update(id: string, dto: UpdateRoutineDto): Promise<routine> {
    return this.prisma.routine.update({
      where: { id },
      data: {
        ...dto,
        dataTarefa: dto.dataTarefa ? new Date(dto.dataTarefa) : undefined,
      },
    });
  }

  async delete(id: string): Promise<routine> {
    return this.prisma.routine.delete({ where: { id } });
  }

  async findChildById(id: string) {
    return this.prisma.children.findUnique({ where: { id } });
  }
}