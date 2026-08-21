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
      horarioInicio: null,
    });

    expect(transaction.routine_recurrence_rule.update).toHaveBeenCalledWith({
      where: { id: 'rule-id' },
      data: {
        dataInicio: new Date(Date.UTC(2026, 8, 1)),
        horarioInicio: null,
      },
    });
    expect(transaction.recurrence_subtask.deleteMany).not.toHaveBeenCalled();
    expect(transaction.recurrence_subtask.createMany).not.toHaveBeenCalled();
  });
});
