import { Module } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';
import { RoutinesRepository } from './routines.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { RoutineTemplatesRepository } from './routines-templates.repository';
import { RoutineTemplatesController } from './routines-templates.controller';
@Module({
  imports: [PrismaModule],
  controllers: [RoutinesController, RoutineTemplatesController],
  providers: [RoutinesService, RoutinesRepository, RoutineTemplatesRepository],
  exports: [RoutinesService],
})
export class RoutinesModule {}
