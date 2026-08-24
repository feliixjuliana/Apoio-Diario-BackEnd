import type { PrismaService } from '../../prisma/prisma.service';
import { RoutineTemplatesRepository } from './routines-templates.repository';

describe('RoutineTemplatesRepository horarioInicio', () => {
  const routineTemplateModel = {
    create: jest.fn(),
    findMany: jest.fn(),
  };
  const childrenModel = {
    findUnique: jest.fn(),
  };
  const transaction = {
    routine_template: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    template_subtask: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
  };
  const prisma = {
    routine_template: routineTemplateModel,
    children: childrenModel,
    $transaction: jest.fn((callback) => callback(transaction)),
  };
  const repository = new RoutineTemplatesRepository(
    prisma as unknown as PrismaService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    transaction.routine_template.findUnique.mockResolvedValue({
      id: 'template-id',
    });
  });

  it.each([
    ['a canonical time', '15:30'],
    ['no defined time', null],
  ])('persists %s when creating a template', async (_, horarioInicio) => {
    routineTemplateModel.create.mockResolvedValue({ id: 'template-id' });

    await repository.create({
      childId: 'child-id',
      nomeTarefa: 'Fazer atividade escolar',
      horarioInicio,
    });

    expect(routineTemplateModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ horarioInicio }),
      }),
    );
  });

  it('creates a template without horarioInicio when the field is omitted', async () => {
    routineTemplateModel.create.mockResolvedValue({ id: 'template-id' });

    await repository.create({
      childId: 'child-id',
      nomeTarefa: 'Fazer atividade escolar',
    });

    const call = routineTemplateModel.create.mock.calls[0][0];
    expect(call.data).not.toHaveProperty('horarioInicio');
  });

  it.each([
    ['changes the time', '08:15'],
    ['removes the time', null],
  ])('%s without replacing omitted subtasks', async (_, horarioInicio) => {
    await repository.updateTemplateTransaction('template-id', {
      horarioInicio,
    });

    expect(transaction.routine_template.update).toHaveBeenCalledWith({
      where: { id: 'template-id' },
      data: { horarioInicio },
    });
    expect(transaction.template_subtask.deleteMany).not.toHaveBeenCalled();
    expect(transaction.template_subtask.createMany).not.toHaveBeenCalled();
  });

  it('keeps horarioInicio out of an update when the field is omitted', async () => {
    await repository.updateTemplateTransaction('template-id', {
      nomeTarefa: 'Novo nome',
    });

    const call = transaction.routine_template.update.mock.calls[0][0];
    expect(call.data).not.toHaveProperty('horarioInicio');
  });

  it('returns horarioInicio when listing templates', async () => {
    const templates = [{ id: 'template-id', horarioInicio: '09:00' }];
    routineTemplateModel.findMany.mockResolvedValue(templates);

    const result = await repository.findByChild('child-id');

    expect(result).toEqual(templates);
  });

  it('loads only the child identity and owner needed for authorization', async () => {
    childrenModel.findUnique.mockResolvedValue({
      id: 'child-id',
      usuarioId: 'user-id',
    });

    await repository.findChildById('child-id');

    expect(childrenModel.findUnique).toHaveBeenCalledWith({
      where: { id: 'child-id' },
      select: { id: true, usuarioId: true },
    });
  });
});
