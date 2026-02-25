import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateRoutineTemplateDto } from './dto/create-routine-template.dto';
import { RoutineTemplatesRepository } from './routines-templates.repository';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('routine-templates')
export class RoutineTemplatesController {
  constructor(private readonly repository: RoutineTemplatesRepository) {}

  @Get(':childId')
  findByChild(@Param('childId') childId: string) {
    return this.repository.findByChild(childId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.repository.delete(id);
  }
}
