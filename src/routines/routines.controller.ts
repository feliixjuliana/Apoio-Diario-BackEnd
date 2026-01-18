import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { AuthGuard } from '../auth/auth.guard';

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
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateRoutineDto) {
    return this.routinesService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.routinesService.remove(id, req.user.id);
  }
}