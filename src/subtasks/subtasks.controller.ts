import { Controller, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SubtasksService } from './subtasks.service';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@UseGuards(AuthGuard)
@Controller('subtasks')
export class SubtasksController {
  constructor(private readonly subtasksService: SubtasksService) {}

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() dto: UpdateSubtaskDto) {
    return this.subtasksService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.subtasksService.remove(id, req.user.id);
  }
}