import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { SubtasksService } from './subtasks.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@UseGuards(AuthGuard)
@Controller('subtask')
export class SubtasksController {
  constructor(private readonly subtasksService: SubtasksService) {}

  @Post()
  create(@Request() req, @Body() body: CreateSubtaskDto) {
    return this.subtasksService.create(req.user.id, body);
  }

  @Patch(':id')
  toggleStatus(
    @Request() req,
    @Body('completed') completed: boolean,
    @Param('id') id: string,
  ) {
    return this.subtasksService.toggleStatus(id, req.user.id, completed);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() body: UpdateSubtaskDto,
  ) {
    return this.subtasksService.update(id, req.user.id, body);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.subtasksService.remove(id, req.user.id);
  }
}
