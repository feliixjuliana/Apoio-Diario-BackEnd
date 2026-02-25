import { Module } from '@nestjs/common';
import { RecurrenceRulesRepository } from './recurrence-rules.repository';
import { RecurrenceRulesService } from './recurrence-rules.service';
import { RecurrenceRulesController } from './recurrence-rules.controller';
import { RoutinesRepository } from 'src/routines/routines.repository';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecurrenceRulesController],
  providers: [
    RecurrenceRulesRepository,
    RecurrenceRulesService,
    RoutinesRepository,
  ],
})
export class RecurrenceRulesModule {}
