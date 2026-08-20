import type { PrismaService } from '../../prisma/prisma.service';
import { RoutinesRepository } from './routines.repository';

describe('RoutinesRepository horarioInicio', () => {
  const routineModel = {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const prisma = { routine: routineModel };
  const repository = new RoutinesRepository(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
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
    routineModel.update.mockResolvedValue({ id: 'routine-id' });

    await repository.update('routine-id', { nomeTarefa: 'Novo nome' });

    const call = routineModel.update.mock.calls[0][0];
    expect(call.data).not.toHaveProperty('horarioInicio');
  });

  it.each([
    ['changes the time', '16:00'],
    ['removes the time', null],
  ])('%s on update', async (_, horarioInicio) => {
    routineModel.update.mockResolvedValue({ id: 'routine-id' });

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
});
