import 'reflect-metadata';
import type { PrismaService } from '../../prisma/prisma.service';
import type { RoutineTemplatesRepository } from './routines-templates.repository';
import type { RoutinesRepository } from './routines.repository';
import { RoutinesService } from './routines.service';

describe('RoutinesService recurrence schedule materialization', () => {
  const recurrenceRuleModel = { findMany: jest.fn() };
  const routineModel = {
    findMany: jest.fn(),
    create: jest.fn(),
  };
  const prisma = {
    routine_recurrence_rule: recurrenceRuleModel,
    routine: routineModel,
    $transaction: jest.fn((operations) => Promise.all(operations)),
  };
  const routinesRepository = { findChildById: jest.fn() };
  const service = new RoutinesService(
    prisma as unknown as PrismaService,
    routinesRepository as unknown as RoutinesRepository,
    {} as RoutineTemplatesRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 7, 20, 12));
    routinesRepository.findChildById.mockResolvedValue({
      id: 'child-id',
      usuarioId: 'user-id',
    });
    routineModel.findMany.mockResolvedValue([]);
    routineModel.create.mockResolvedValue({ id: 'routine-id' });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function recurrenceRule(overrides: Record<string, unknown> = {}) {
    return {
      id: 'rule-id',
      childId: 'child-id',
      nomeTarefa: 'Tomar medicação',
      duracaoMinutos: null,
      imgTarefa: null,
      horarioInicio: '02:00',
      dataInicio: new Date(Date.UTC(2026, 7, 21)),
      subtarefas: [],
      ...overrides,
    };
  }

  it('does not materialize an occurrence before dataInicio', async () => {
    recurrenceRuleModel.findMany.mockResolvedValue([
      recurrenceRule({ dataInicio: new Date(Date.UTC(2026, 7, 22)) }),
    ]);

    await service.ensureRecurrencesForDate('user-id', 'child-id', '2026-08-21');

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(routineModel.create).not.toHaveBeenCalled();
  });

  it('materializes horarioInicio on dataInicio without changing the date', async () => {
    recurrenceRuleModel.findMany.mockResolvedValue([recurrenceRule()]);

    await service.ensureRecurrencesForDate('user-id', 'child-id', '2026-08-21');

    const data = routineModel.create.mock.calls[0][0].data;
    expect(data.horarioInicio).toBe('02:00');
    expect(data.dataTarefa.getFullYear()).toBe(2026);
    expect(data.dataTarefa.getMonth()).toBe(7);
    expect(data.dataTarefa.getDate()).toBe(21);
  });

  it('materializes a recurrence without horarioInicio', async () => {
    recurrenceRuleModel.findMany.mockResolvedValue([
      recurrenceRule({ horarioInicio: null }),
    ]);

    await service.ensureRecurrencesForDate('user-id', 'child-id', '2026-08-21');

    expect(routineModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ horarioInicio: null }),
      }),
    );
  });

  it('keeps legacy recurrence rules without dataInicio compatible', async () => {
    recurrenceRuleModel.findMany.mockResolvedValue([
      recurrenceRule({ dataInicio: null }),
    ]);

    await service.ensureRecurrencesForDate('user-id', 'child-id', '2026-08-21');

    expect(routineModel.create).toHaveBeenCalled();
  });
});
