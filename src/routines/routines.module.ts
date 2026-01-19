import { Module } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';
import { RoutinesRepository } from './routines.repository';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [RoutinesController],
  providers: [RoutinesService, RoutinesRepository],
  exports: [RoutinesService],
})
export class RoutinesModule {}
