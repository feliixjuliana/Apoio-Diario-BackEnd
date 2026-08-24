import { NotFoundException } from '@nestjs/common';
import type { RoutineTemplatesRepository } from './routines-templates.repository';
import { RoutineTemplatesService } from './routines-templates.service';

describe('RoutineTemplatesService ownership', () => {
  const children = [
    { id: 'child-a', usuarioId: 'user-a' },
    { id: 'child-b', usuarioId: 'user-b' },
  ];
  let templates: Array<{
    id: string;
    childId: string;
    nomeTarefa: string;
    crianca: { usuarioId: string };
  }>;
  const repository = {
    findChildById: jest.fn((id: string) =>
      Promise.resolve(children.find((child) => child.id === id) ?? null),
    ),
    findByChild: jest.fn((childId: string) =>
      Promise.resolve(
        templates.filter((template) => template.childId === childId),
      ),
    ),
    findById: jest.fn((id: string) =>
      Promise.resolve(templates.find((template) => template.id === id) ?? null),
    ),
    delete: jest.fn((id: string) => {
      templates = templates.filter((template) => template.id !== id);
      return Promise.resolve();
    }),
    updateTemplateTransaction: jest.fn((id: string) =>
      Promise.resolve(templates.find((template) => template.id === id)),
    ),
  };
  const service = new RoutineTemplatesService(
    repository as unknown as RoutineTemplatesRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    templates = [
      {
        id: 'template-a',
        childId: 'child-a',
        nomeTarefa: 'Template A',
        crianca: { usuarioId: 'user-a' },
      },
      {
        id: 'template-b',
        childId: 'child-b',
        nomeTarefa: 'Template B',
        crianca: { usuarioId: 'user-b' },
      },
    ];
  });

  it('lists templates from the authenticated user child', async () => {
    await expect(service.findByChild('user-a', 'child-a')).resolves.toEqual([
      expect.objectContaining({ id: 'template-a' }),
    ]);
  });

  it('does not list templates from another user child', async () => {
    await expect(
      service.findByChild('user-a', 'child-b'),
    ).rejects.toMatchObject({
      status: 404,
      message: 'Criança não encontrada',
    });
    expect(repository.findByChild).not.toHaveBeenCalled();
  });

  it('uses the same safe response for an unknown or unauthorized child', async () => {
    const errors = await Promise.all(
      ['missing-child', 'child-b'].map(async (childId) => {
        try {
          await service.findByChild('user-a', childId);
        } catch (error) {
          return error;
        }
      }),
    );

    expect(errors).toEqual([
      expect.objectContaining({
        status: 404,
        message: 'Criança não encontrada',
      }),
      expect.objectContaining({
        status: 404,
        message: 'Criança não encontrada',
      }),
    ]);
  });

  it('deletes an owned template', async () => {
    await expect(service.remove('user-a', 'template-a')).resolves.toEqual({
      message: 'Template removido com sucesso',
    });
    expect(templates.map((template) => template.id)).toEqual(['template-b']);
  });

  it('does not delete another user template', async () => {
    await expect(service.remove('user-a', 'template-b')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.delete).not.toHaveBeenCalled();
    expect(templates.map((template) => template.id)).toContain('template-b');
  });

  it('uses the same safe response for an unknown or unauthorized template', async () => {
    const errors = await Promise.all(
      ['missing-template', 'template-b'].map(async (templateId) => {
        try {
          await service.remove('user-a', templateId);
        } catch (error) {
          return error;
        }
      }),
    );

    expect(errors).toEqual([
      expect.objectContaining({
        status: 404,
        message: 'Template não encontrado',
      }),
      expect.objectContaining({
        status: 404,
        message: 'Template não encontrado',
      }),
    ]);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('keeps authorized PATCH working', async () => {
    await service.update('user-a', 'template-a', {
      nomeTarefa: 'Template atualizado',
    });

    expect(repository.updateTemplateTransaction).toHaveBeenCalledWith(
      'template-a',
      { nomeTarefa: 'Template atualizado' },
    );
  });

  it('returns the same 404 from PATCH for an unknown or unauthorized template', async () => {
    await expect(
      service.update('user-a', 'template-b', { nomeTarefa: 'Tentativa' }),
    ).rejects.toMatchObject({
      status: 404,
      message: 'Template não encontrado',
    });
    expect(repository.updateTemplateTransaction).not.toHaveBeenCalled();
  });
});
