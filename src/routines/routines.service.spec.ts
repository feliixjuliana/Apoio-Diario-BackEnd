import 'reflect-metadata';
import type { PrismaService } from '../../prisma/prisma.service';
import type { CreateRoutineDto } from './dto/create-routine.dto';
import type { RoutineTemplatesRepository } from './routines-templates.repository';
import type { RoutinesRepository } from './routines.repository';
import { RoutinesService } from './routines.service';

describe('RoutinesService template horarioInicio flow', () => {
  const routinesRepository = {
    findChildById: jest.fn(),
    create: jest.fn(),
  };
  const templatesRepository = {
    create: jest.fn(),
    findById: jest.fn(),
  };
  const service = new RoutinesService(
    {} as PrismaService,
    routinesRepository as unknown as RoutinesRepository,
    templatesRepository as unknown as RoutineTemplatesRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    routinesRepository.findChildById.mockResolvedValue({
      id: 'child-id',
      usuarioId: 'user-id',
    });
  });

  it('copies horarioInicio when creating only a template', async () => {
    templatesRepository.create.mockResolvedValue({ id: 'template-id' });

    await service.create('user-id', {
      childId: 'child-id',
      nomeTarefa: 'Fazer atividade escolar',
      horarioInicio: '15:30',
      salvarComoTemplate: true,
    } as CreateRoutineDto);

    expect(templatesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ horarioInicio: '15:30' }),
    );
    expect(routinesRepository.create).not.toHaveBeenCalled();
  });

  it('copies horarioInicio when saving an activity as a template', async () => {
    routinesRepository.create.mockResolvedValue({ id: 'routine-id' });
    templatesRepository.create.mockResolvedValue({ id: 'template-id' });

    await service.create('user-id', {
      childId: 'child-id',
      nomeTarefa: 'Fazer atividade escolar',
      dataTarefa: '2026-08-20',
      horarioInicio: '15:30',
      salvarComoTemplate: true,
    });

    expect(templatesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ horarioInicio: '15:30' }),
    );
  });

  it('copies the template time to the activity created for today', async () => {
    templatesRepository.findById.mockResolvedValue({
      id: 'template-id',
      childId: 'child-id',
      nomeTarefa: 'Fazer atividade escolar',
      duracaoMinutos: null,
      imgTarefa: null,
      horarioInicio: '15:30',
      subtarefas: [],
    });
    routinesRepository.create.mockResolvedValue({ id: 'routine-id' });

    await service.createFromTemplate('template-id', 'user-id');

    expect(routinesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ horarioInicio: '15:30' }),
    );
  });
});
