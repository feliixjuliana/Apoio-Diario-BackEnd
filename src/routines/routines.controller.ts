import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ReorderRoutinesDto } from './dto/reorder-routines.dto';

@UseGuards(AuthGuard)
@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateRoutineDto) {
    return this.routinesService.create(req.user.id, dto);
  }

  @Get('child/:childId')
  findAll(@Param('childId') childId: string, @Request() req: any) {
    return this.routinesService.findAllByChild(childId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.routinesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateRoutineDto,
  ) {
    return this.routinesService.update(id, req.user.id, dto);
  }

  @Patch('reorder/batch')
  reorder(@Request() req, @Body() dto: ReorderRoutinesDto) {
    return this.routinesService.reorder(req.user.id, dto);
  }

  @Post(':id/instantiate')
  instantiateFromRecurring(@Request() req: any, @Param('id') id: string) {
    return this.routinesService.instantiateFromRecurring(req.user.id, id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.routinesService.remove(id, req.user.id);
  }
}
