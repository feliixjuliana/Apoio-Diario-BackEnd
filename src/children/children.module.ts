import { Module } from '@nestjs/common';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';
import { ChildrenRepository } from './children.repository';

@Module({
  controllers: [ChildrenController],
  providers: [ChildrenService, ChildrenRepository],
})
export class ChildrenModule {}