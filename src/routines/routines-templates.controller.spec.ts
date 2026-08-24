import 'reflect-metadata';
import { RoutineTemplatesController } from './routines-templates.controller';
import type { RoutineTemplatesService } from './routines-templates.service';

describe('RoutineTemplatesController ownership forwarding', () => {
  const service = {
    findByChild: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };
  const controller = new RoutineTemplatesController(
    service as unknown as RoutineTemplatesService,
  );
  const req = { user: { id: 'user-id' } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('forwards the authenticated user when listing templates', async () => {
    service.findByChild.mockResolvedValue([]);

    await controller.findByChild(req, 'child-id');

    expect(service.findByChild).toHaveBeenCalledWith('user-id', 'child-id');
  });

  it('forwards the authenticated user when deleting a template', async () => {
    service.remove.mockResolvedValue({
      message: 'Template removido com sucesso',
    });

    await controller.remove(req, 'template-id');

    expect(service.remove).toHaveBeenCalledWith('user-id', 'template-id');
  });

  it('keeps forwarding the authenticated user when updating a template', async () => {
    service.update.mockResolvedValue({ id: 'template-id' });
    const dto = { nomeTarefa: 'Atualizada' };

    await controller.update(req, 'template-id', dto);

    expect(service.update).toHaveBeenCalledWith('user-id', 'template-id', dto);
  });
});
