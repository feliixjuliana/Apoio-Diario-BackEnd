import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { RoutineTemplatesRepository } from './routines-templates.repository';
import { UpdateRoutineTemplateDto } from './dto/update-routine-template.dto';

@Injectable()
export class RoutineTemplatesService {
  constructor(private readonly templatesRepo: RoutineTemplatesRepository) {}

  async update(userId: string, id: string, dto: UpdateRoutineTemplateDto) {
    const template = await this.templatesRepo.findById(id);

    if (!template) {
      throw new NotFoundException('Template não encontrado');
    }

    if (template.crianca.usuarioId !== userId) {
      throw new ForbiddenException('Acesso negado');
    }

    return this.templatesRepo.updateTemplateTransaction(id, dto);
  }
}
