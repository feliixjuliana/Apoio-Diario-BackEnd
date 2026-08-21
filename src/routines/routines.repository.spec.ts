import type { PrismaService } from '../../prisma/prisma.service';
import { RoutinesRepository } from './routines.repository';

describe('RoutinesRepository horarioInicio', () => {
  const routineModel = {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  };
  const prisma = {
    routine: routineModel,
    $transaction: jest.fn((operation) =>
      typeof operation === 'function'
        ? operation({ routine: routineModel })
        : Promise.all(operation),
    ),
  };
  const repository = new RoutinesRepository(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
    routineModel.findMany.mockResolvedValue([]);
    routineModel.findUnique.mockResolvedValue(null);
  });

  it.each([
    ['a canonical time', '09:30'],
    ['no defined time', null],
  ])('persists %s when creating a routine', async (_, horarioInicio) => {
    routineModel.findFirst.mockResolvedValue(null);
    routineModel.create.mockResolvedValue({ id: 'routine-id' });

    await repository.create({
      childId: 'child-id',
      nomeTarefa: 'Tomar café',
      dataTarefa: '2026-08-20',
      horarioInicio,
    });

    expect(routineModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ horarioInicio }),
      }),
    );
  });

  it('creates a routine without horarioInicio when the field is omitted', async () => {
    routineModel.findFirst.mockResolvedValue(null);
    routineModel.create.mockResolvedValue({ id: 'routine-id' });

    await repository.create({
      childId: 'child-id',
      nomeTarefa: 'Tomar café',
      dataTarefa: '2026-08-20',
    });

    const call = routineModel.create.mock.calls[0][0];
    expect(call.data).not.toHaveProperty('horarioInicio');
  });

  it('keeps horarioInicio out of an update when the field is omitted', async () => {
    routineModel.findUnique
      .mockResolvedValueOnce({
        childId: 'child-id',
        dataTarefa: new Date('2026-08-20T00:00:00.000Z'),
      })
      .mockResolvedValueOnce(null);
    routineModel.update.mockResolvedValue({
      id: 'routine-id',
      childId: 'child-id',
      dataTarefa: new Date('2026-08-20T00:00:00.000Z'),
    });

    await repository.update('routine-id', { nomeTarefa: 'Novo nome' });

    const call = routineModel.update.mock.calls[0][0];
    expect(call.data).not.toHaveProperty('horarioInicio');
  });

  it.each([
    ['changes the time', '16:00'],
    ['removes the time', null],
  ])('%s on update', async (_, horarioInicio) => {
    routineModel.findUnique
      .mockResolvedValueOnce({
        childId: 'child-id',
        dataTarefa: new Date('2026-08-20T00:00:00.000Z'),
      })
      .mockResolvedValueOnce(null);
    routineModel.update.mockResolvedValue({
      id: 'routine-id',
      childId: 'child-id',
      dataTarefa: new Date('2026-08-20T00:00:00.000Z'),
    });

    await repository.update('routine-id', { horarioInicio });

    expect(routineModel.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ horarioInicio }),
      }),
    );
  });

  it('returns horarioInicio in the daily listing result', async () => {
    const routines = [{ id: 'routine-id', horarioInicio: '08:00' }];
    routineModel.findMany.mockResolvedValue(routines);

    const result = await repository.findByChildAndDate(
      'child-id',
      '2026-08-20',
    );

    expect(result).toEqual(routines);
  });

  it('reconciles timed priorities when creating an activity', async () => {
    routineModel.findFirst.mockResolvedValue({ prioridade: 2 });
    routineModel.create.mockResolvedValue({
      id: '10h',
      childId: 'child-id',
      dataTarefa: new Date('2026-08-20T00:00:00.000Z'),
    });
    routineModel.findMany.mockResolvedValue([
      { id: '15h', prioridade: 1, horarioInicio: '15:00' },
      { id: 'livre', prioridade: 2, horarioInicio: null },
      { id: '10h', prioridade: 3, horarioInicio: '10:00' },
    ]);

    await repository.create({
      childId: 'child-id',
      nomeTarefa: 'Atividade das dez',
      dataTarefa: '2026-08-20',
      horarioInicio: '10:00',
    });

    expect(routineModel.update).toHaveBeenCalledWith({
      where: { id: '10h' },
      data: { prioridade: 1 },
    });
    expect(routineModel.update).toHaveBeenCalledWith({
      where: { id: '15h' },
      data: { prioridade: 3 },
    });
  });

  it('reconciles priorities when editing or removing horarioInicio', async () => {
    routineModel.findUnique
      .mockResolvedValueOnce({
        childId: 'child-id',
        dataTarefa: new Date('2026-08-20T00:00:00.000Z'),
      })
      .mockResolvedValueOnce(null);
    routineModel.update.mockResolvedValue({
      id: 'editada',
      childId: 'child-id',
      dataTarefa: new Date('2026-08-20T00:00:00.000Z'),
    });
    routineModel.findMany.mockResolvedValue([
      { id: '15h', prioridade: 1, horarioInicio: '15:00' },
      { id: 'editada', prioridade: 2, horarioInicio: null },
      { id: '10h', prioridade: 3, horarioInicio: '10:00' },
    ]);

    await repository.update('editada', { horarioInicio: null });

    expect(routineModel.update).toHaveBeenCalledWith({
      where: { id: '10h' },
      data: { prioridade: 1 },
    });
    expect(routineModel.update).toHaveBeenCalledWith({
      where: { id: '15h' },
      data: { prioridade: 3 },
    });
  });

  it('submits the complete priority update as one transaction', async () => {
    const items = [
      { id: 'a', prioridade: 1 },
      { id: 'b', prioridade: 2 },
    ];

    await repository.reorder(items);

    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Array));
    expect(prisma.$transaction.mock.calls[0][0]).toHaveLength(2);
  });

  it('propagates a transaction failure without retrying partial updates', async () => {
    prisma.$transaction.mockRejectedValueOnce(new Error('rollback'));

    await expect(
      repository.reorder([
        { id: 'a', prioridade: 1 },
        { id: 'b', prioridade: 2 },
      ]),
    ).rejects.toThrow('rollback');
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
