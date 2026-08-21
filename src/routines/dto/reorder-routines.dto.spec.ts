import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ReorderRoutinesDto } from './reorder-routines.dto';

describe('ReorderRoutinesDto', () => {
  it('accepts a complete sequence with unique positive priorities', async () => {
    const dto = plainToInstance(ReorderRoutinesDto, {
      items: [
        { id: 'a', prioridade: 1 },
        { id: 'b', prioridade: 2 },
      ],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it.each([
    [[]],
    [
      [
        { id: 'a', prioridade: 1 },
        { id: 'a', prioridade: 2 },
      ],
    ],
    [
      [
        { id: 'a', prioridade: 1 },
        { id: 'b', prioridade: 1 },
      ],
    ],
    [[{ id: 'a', prioridade: 0 }]],
    [[null]],
  ])('rejects an invalid reorder sequence: %p', async (items) => {
    const dto = plainToInstance(ReorderRoutinesDto, { items });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });
});
