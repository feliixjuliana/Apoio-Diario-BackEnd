import {
  Controller,
  Get,
  Param,
  Delete,
  Req,
  UseGuards,
  Patch,
  Body,
} from '@nestjs/common';
import { RoutineTemplatesRepository } from './routines-templates.repository';
import { RoutineTemplatesService } from './routines-templates.service';
import { UpdateRoutineTemplateDto } from './dto/update-routine-template.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('routine-templates')
export class RoutineTemplatesController {
  constructor(
    private readonly repository: RoutineTemplatesRepository,
    private readonly service: RoutineTemplatesService,
  ) {}

  @Get(':childId')
  findByChild(@Param('childId') childId: string) {
    return this.repository.findByChild(childId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.repository.delete(id);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateRoutineTemplateDto,
  ) {
    return this.service.update(req.user.id, id, dto);
  }
}
