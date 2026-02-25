// recurrence-rules.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RecurrenceRulesService } from './recurrence-rules.service';
import { CreateRecurrenceRuleDto } from './dto/create-recurrence-rule.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('recurrence-rules')
export class RecurrenceRulesController {
  constructor(private readonly service: RecurrenceRulesService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateRecurrenceRuleDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get(':childId')
  list(@Req() req: any, @Param('childId') childId: string) {
    return this.service.listByChild(req.user.id, childId);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.id, id);
  }
}
