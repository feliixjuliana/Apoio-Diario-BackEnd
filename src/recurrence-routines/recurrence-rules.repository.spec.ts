import type { PrismaService } from '../../prisma/prisma.service';
import { RecurrenceRulesRepository } from './recurrence-rules.repository';

describe('RecurrenceRulesRepository schedule persistence', () => {
  const recurrenceRuleModel = {
    create: jest.fn(),
  };
  const transaction = {
    routine_recurrence_rule: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    recurrence_subtask: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    routine: {
      updateMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };
  const prisma = {
    routine_recurrence_rule: recurrenceRuleModel,
    $transaction: jest.fn((callback) => callback(transaction)),
  };
  const repository = new RecurrenceRulesRepository(
    prisma as unknown as PrismaService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    transaction.routine_recurrence_rule.findUnique.mockResolvedValue({
      id: 'rule-id',
    });
    transaction.routine.findMany.mockResolvedValue([]);
  });

  it('persists dataInicio as a civil date and horarioInicio as text', async () => {
    recurrenceRuleModel.create.mockResolvedValue({ id: 'rule-id' });

    await repository.create({
      childId: 'child-id',
      nomeTarefa: 'Tomar medicação',
      diasSemana: [2, 4, 6],
      dataInicio: '2026-08-21',
      horarioInicio: '02:00',
    });

    expect(recurrenceRuleModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          dataInicio: new Date(Date.UTC(2026, 7, 21)),
          horarioInicio: '02:00',
        }),
      }),
    );
  });

  it('updates the schedule without replacing omitted subtasks', async () => {
    await repository.updateRuleTransaction('rule-id', {
      dataInicio: '2026-09-01',
    });

    expect(transaction.routine_recurrence_rule.update).toHaveBeenCalledWith({
      where: { id: 'rule-id' },
      data: {
        dataInicio: new Date(Date.UTC(2026, 8, 1)),
      },
    });
    expect(transaction.routine.updateMany).not.toHaveBeenCalled();
    expect(transaction.recurrence_subtask.deleteMany).not.toHaveBeenCalled();
    expect(transaction.recurrence_subtask.createMany).not.toHaveBeenCalled();
  });

  it('propagates a changed time to pending future occurrences and eligible occurrences today', async () => {
    await repository.updateRuleTransaction(
      'rule-id',
      { horarioInicio: '16:00' },
      new Date('2026-08-21T15:30:00.000Z'),
    );

    expect(transaction.routine.updateMany).toHaveBeenCalledWith({
      where: {
        recurrenceRuleId: 'rule-id',
        tarefaCompletada: false,
        OR: [
          {
            dataTarefa: { gte: new Date('2026-08-22T00:00:00.000Z') },
          },
          {
            dataTarefa: {
              gte: new Date('2026-08-21T00:00:00.000Z'),
              lt: new Date('2026-08-22T00:00:00.000Z'),
            },
            OR: [{ horarioInicio: { gte: '12:30' } }, { horarioInicio: null }],
          },
        ],
      },
      data: { horarioInicio: '16:00' },
    });
  });

  it('does not add an occurrence without a time today when the new time has passed', async () => {
    await repository.updateRuleTransaction(
      'rule-id',
      { horarioInicio: '11:00' },
      new Date('2026-08-21T15:30:00.000Z'),
    );

    const call = transaction.routine.updateMany.mock.calls[0][0];
    expect(call.where.OR[1].OR).toEqual([{ horarioInicio: { gte: '12:30' } }]);
  });

  it('leaves completed occurrences unchanged', async () => {
    await repository.updateRuleTransaction(
      'rule-id',
      { horarioInicio: '16:00' },
      new Date('2026-08-21T15:30:00.000Z'),
    );

    const call = transaction.routine.updateMany.mock.calls[0][0];
    expect(call.where.tarefaCompletada).toBe(false);
  });

  it('leaves historical and already-passed occurrences today unchanged', async () => {
    await repository.updateRuleTransaction(
      'rule-id',
      { horarioInicio: '16:00' },
      new Date('2026-08-21T15:30:00.000Z'),
    );

    const call = transaction.routine.updateMany.mock.calls[0][0];
    expect(call.where.OR).toEqual(
      expect.arrayContaining([
        {
          dataTarefa: { gte: new Date('2026-08-22T00:00:00.000Z') },
        },
        expect.objectContaining({
          dataTarefa: {
            gte: new Date('2026-08-21T00:00:00.000Z'),
            lt: new Date('2026-08-22T00:00:00.000Z'),
          },
          OR: expect.arrayContaining([{ horarioInicio: { gte: '12:30' } }]),
        }),
      ]),
    );
  });

  it('removes the time only from eligible pending occurrences', async () => {
    await repository.updateRuleTransaction(
      'rule-id',
      { horarioInicio: null },
      new Date('2026-08-21T15:30:00.000Z'),
    );

    expect(transaction.routine.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          recurrenceRuleId: 'rule-id',
          tarefaCompletada: false,
        }),
        data: { horarioInicio: null },
      }),
    );
    const call = transaction.routine.updateMany.mock.calls[0][0];
    expect(call.where.OR[1].OR).toEqual([{ horarioInicio: { gte: '12:30' } }]);
  });

  it('does not change dataInicio when only horarioInicio is edited', async () => {
    await repository.updateRuleTransaction('rule-id', {
      horarioInicio: '18:00',
    });

    const call = transaction.routine_recurrence_rule.update.mock.calls[0][0];
    expect(call.data).not.toHaveProperty('dataInicio');
  });

  it('reconciles priorities on every day affected by a recurrence time change', async () => {
    transaction.routine.findMany
      .mockResolvedValueOnce([
        {
          childId: 'child-id',
          dataTarefa: new Date('2026-08-22T00:00:00.000Z'),
        },
      ])
      .mockResolvedValueOnce([
        { id: '15h', prioridade: 1, horarioInicio: '15:00' },
        { id: 'livre', prioridade: 2, horarioInicio: null },
        { id: '10h', prioridade: 3, horarioInicio: '10:00' },
      ]);

    await repository.updateRuleTransaction(
      'rule-id',
      { horarioInicio: '10:00' },
      new Date('2026-08-21T15:30:00.000Z'),
    );

    expect(transaction.routine.update).toHaveBeenCalledWith({
      where: { id: '10h' },
      data: { prioridade: 1 },
    });
    expect(transaction.routine.update).toHaveBeenCalledWith({
      where: { id: '15h' },
      data: { prioridade: 3 },
    });
  });
});
