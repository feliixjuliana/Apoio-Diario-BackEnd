import { Injectable, NotFoundException } from '@nestjs/common';
import { RoutineTemplatesRepository } from './routines-templates.repository';
import { UpdateRoutineTemplateDto } from './dto/update-routine-template.dto';

@Injectable()
export class RoutineTemplatesService {
  constructor(private readonly templatesRepo: RoutineTemplatesRepository) {}

  async findByChild(userId: string, childId: string) {
    const child = await this.templatesRepo.findChildById(childId);

    if (!child || child.usuarioId !== userId) {
      throw new NotFoundException('Criança não encontrada');
    }

    return this.templatesRepo.findByChild(childId);
  }

  async remove(userId: string, id: string) {
    const template = await this.findOwnedTemplate(userId, id);

    await this.templatesRepo.delete(template.id);
    return { message: 'Template removido com sucesso' };
  }

  async update(userId: string, id: string, dto: UpdateRoutineTemplateDto) {
    await this.findOwnedTemplate(userId, id);

    return this.templatesRepo.updateTemplateTransaction(id, dto);
  }

  private async findOwnedTemplate(userId: string, id: string) {
    const template = await this.templatesRepo.findById(id);

    if (!template || template.crianca.usuarioId !== userId) {
      throw new NotFoundException('Template não encontrado');
    }

    return template;
  }
}
