import { Module } from '@nestjs/common';
import { SubtasksController } from './subtasks.controller';
import { SubtasksService } from './subtasks.service';
import { SubtasksRepository } from './subtasks.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubtasksController],
  providers: [SubtasksService, SubtasksRepository],
})
export class SubtasksModule {}