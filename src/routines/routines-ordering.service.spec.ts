import 'reflect-metadata';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';
import type { RoutineTemplatesRepository } from './routines-templates.repository';
import type { RoutinesRepository } from './routines.repository';
import { RoutinesService } from './routines.service';

describe('RoutinesService safe reordering', () => {
  const repository = {
    findManyByIds: jest.fn(),
    findByChildAndDate: jest.fn(),
    reorder: jest.fn(),
  };
  const service = new RoutinesService(
    {} as PrismaService,
    repository as unknown as RoutinesRepository,
    {} as RoutineTemplatesRepository,
  );
  const dataTarefa = new Date('2026-08-21T00:00:00.000Z');

  function rotina(
    id: string,
    prioridade: number,
    horarioInicio: string | null,
    overrides: Record<string, unknown> = {},
  ) {
    return {
      id,
      prioridade,
      horarioInicio,
      childId: 'child-id',
      dataTarefa,
      crianca: { usuarioId: 'user-id' },
      ...overrides,
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    const rotinas = [
      rotina('10h', 1, '10:00'),
      rotina('livre', 2, null),
      rotina('15h', 3, '15:00'),
    ];
    repository.findManyByIds.mockResolvedValue(rotinas);
    repository.findByChildAndDate.mockResolvedValue(rotinas);
    repository.reorder.mockResolvedValue([]);
  });

  it('allows an untimed activity to cross a timed activity', async () => {
    const items = [
      { id: 'livre', prioridade: 1 },
      { id: '10h', prioridade: 2 },
      { id: '15h', prioridade: 3 },
    ];

    await service.reorder('user-id', { items });

    expect(repository.reorder).toHaveBeenCalledWith(items);
  });

  it('rejects an attempt to invert timed activities', async () => {
    const items = [
      { id: '15h', prioridade: 1 },
      { id: 'livre', prioridade: 2 },
      { id: '10h', prioridade: 3 },
    ];

    await expect(service.reorder('user-id', { items })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.reorder).not.toHaveBeenCalled();
  });

  it('preserves the previous relative priority for activities with a time', async () => {
    const rotinas = [
      rotina('primeiro', 1, '10:00'),
      rotina('segundo', 2, '10:00'),
    ];
    repository.findManyByIds.mockResolvedValue(rotinas);
    repository.findByChildAndDate.mockResolvedValue(rotinas);

    await expect(
      service.reorder('user-id', {
        items: [
          { id: 'segundo', prioridade: 1 },
          { id: 'primeiro', prioridade: 2 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts an existing priority order that is not chronological', async () => {
    const rotinas = [
      rotina('brincar', 1, '12:50'),
      rotina('estudar', 2, '14:00'),
      rotina('descansar', 3, '11:00'),
    ];
    repository.findManyByIds.mockResolvedValue(rotinas);
    repository.findByChildAndDate.mockResolvedValue(rotinas);
    const items = [
      { id: 'brincar', prioridade: 1 },
      { id: 'estudar', prioridade: 2 },
      { id: 'descansar', prioridade: 3 },
    ];

    await service.reorder('user-id', { items });

    expect(repository.reorder).toHaveBeenCalledWith(items);
  });

  it('allows completed timed activities to be moved after pending activities', async () => {
    const rotinas = [
      rotina('concluida', 1, '08:00', { tarefaCompletada: true }),
      rotina('pendente-10h', 2, '10:00'),
      rotina('livre', 3, null),
      rotina('pendente-14h', 4, '14:00'),
    ];
    repository.findManyByIds.mockResolvedValue(rotinas);
    repository.findByChildAndDate.mockResolvedValue(rotinas);
    const items = [
      { id: 'pendente-10h', prioridade: 1 },
      { id: 'livre', prioridade: 2 },
      { id: 'pendente-14h', prioridade: 3 },
      { id: 'concluida', prioridade: 4 },
    ];

    await service.reorder('user-id', { items });

    expect(repository.reorder).toHaveBeenCalledWith(items);
  });

  it('validates ownership for every received activity', async () => {
    repository.findManyByIds.mockResolvedValue([
      rotina('10h', 1, '10:00'),
      rotina('intrusa', 2, null, { crianca: { usuarioId: 'other-user' } }),
    ]);

    await expect(
      service.reorder('user-id', {
        items: [
          { id: '10h', prioridade: 1 },
          { id: 'intrusa', prioridade: 2 },
        ],
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.reorder).not.toHaveBeenCalled();
  });

  it.each([
    ['another child', { childId: 'other-child' }],
    ['another date', { dataTarefa: new Date('2026-08-22T00:00:00.000Z') }],
  ])('rejects an item from %s', async (_, overrides) => {
    repository.findManyByIds.mockResolvedValue([
      rotina('10h', 1, '10:00'),
      rotina('invalida', 2, null, overrides),
    ]);

    await expect(
      service.reorder('user-id', {
        items: [
          { id: '10h', prioridade: 1 },
          { id: 'invalida', prioridade: 2 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.reorder).not.toHaveBeenCalled();
  });

  it('rejects a partial daily sequence', async () => {
    repository.findManyByIds.mockResolvedValue([
      rotina('10h', 1, '10:00'),
      rotina('15h', 2, '15:00'),
    ]);

    await expect(
      service.reorder('user-id', {
        items: [
          { id: '10h', prioridade: 1 },
          { id: '15h', prioridade: 2 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not hide a transactional reorder failure', async () => {
    repository.reorder.mockRejectedValue(new Error('transaction failed'));

    await expect(
      service.reorder('user-id', {
        items: [
          { id: '10h', prioridade: 1 },
          { id: 'livre', prioridade: 2 },
          { id: '15h', prioridade: 3 },
        ],
      }),
    ).rejects.toThrow('transaction failed');
  });
});
