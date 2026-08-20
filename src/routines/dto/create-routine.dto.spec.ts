import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateRoutineDto } from './create-routine.dto';
import { UpdateRoutineDto } from './update-routine.dto';

const validRoutine = {
  childId: 'child-id',
  nomeTarefa: 'Tomar café',
  dataTarefa: '2026-08-20',
};

describe('horarioInicio validation', () => {
  it.each([undefined, null, '00:00', '09:30', '23:59'])(
    'accepts %p when creating a routine',
    async (horarioInicio) => {
      const dto = plainToInstance(CreateRoutineDto, {
        ...validRoutine,
        horarioInicio,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    },
  );

  it.each(['9:30', '24:00', '12:60'])(
    'rejects %s when creating a routine',
    async (horarioInicio) => {
      const dto = plainToInstance(CreateRoutineDto, {
        ...validRoutine,
        horarioInicio,
      });

      const errors = await validate(dto);

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ property: 'horarioInicio' }),
        ]),
      );
    },
  );

  it.each([{}, { horarioInicio: null }, { horarioInicio: '15:45' }])(
    'accepts update payload %p',
    async (payload) => {
      const dto = plainToInstance(UpdateRoutineDto, payload);

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    },
  );

  it('rejects an invalid time when updating a routine', async () => {
    const dto = plainToInstance(UpdateRoutineDto, {
      horarioInicio: '25:10',
    });

    const errors = await validate(dto);

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'horarioInicio' }),
      ]),
    );
  });
});
