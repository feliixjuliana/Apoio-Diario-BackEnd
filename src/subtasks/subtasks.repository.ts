import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { subtask } from '@prisma/client';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class SubtasksRepository {
  constructor(private readonly prisma: PrismaService) {}

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

  async update(id: string, dto: UpdateSubtaskDto): Promise<subtask> {
    return this.prisma.subtask.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.subtask.delete({
      where: { id },
    });
  }
}