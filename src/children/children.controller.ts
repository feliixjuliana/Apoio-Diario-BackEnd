import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Post()
  create(@Request() req, @Body() body: any) {
    return this.childrenService.create(req.user.id, body);
  }

  @Get()
  findAll(@Request() req) {
    return this.childrenService.findAllByParent(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.childrenService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Request() req, @Body() body: any) {
    return this.childrenService.update(id, req.user.id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.childrenService.remove(id, req.user.id);
  }
}