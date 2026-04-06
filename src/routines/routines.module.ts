import { Module } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';
import { RoutinesRepository } from './routines.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { RoutineTemplatesRepository } from './routines-templates.repository';
import { RoutineTemplatesController } from './routines-templates.controller';
import { RoutineTemplatesService } from './routines-templates.service';
import { FilesModule } from 'src/files/files.module';
@Module({
  imports: [PrismaModule, FilesModule],
  controllers: [RoutinesController, RoutineTemplatesController],
  providers: [
    RoutinesService,
    RoutinesRepository,
    RoutineTemplatesRepository,
    RoutineTemplatesService,
  ],
  exports: [RoutinesService],
})
export class RoutinesModule {}
