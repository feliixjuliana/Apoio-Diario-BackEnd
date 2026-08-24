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
import { RoutineTemplatesService } from './routines-templates.service';
import { UpdateRoutineTemplateDto } from './dto/update-routine-template.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('routine-templates')
export class RoutineTemplatesController {
  constructor(private readonly service: RoutineTemplatesService) {}

  @Get(':childId')
  findByChild(@Req() req: any, @Param('childId') childId: string) {
    return this.service.findByChild(req.user.id, childId);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.id, id);
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
