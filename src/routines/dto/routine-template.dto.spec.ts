import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateRoutineTemplateDto } from './create-routine-template.dto';
import { UpdateRoutineTemplateDto } from './update-routine-template.dto';

const validTemplate = {
  childId: 'child-id',
  nomeTarefa: 'Fazer atividade escolar',
};

describe('routine template horarioInicio validation', () => {
  it.each([undefined, null, '00:00', '15:30', '23:59'])(
    'accepts %p when creating a template',
    async (horarioInicio) => {
      const dto = plainToInstance(CreateRoutineTemplateDto, {
        ...validTemplate,
        horarioInicio,
      });

      expect(await validate(dto)).toHaveLength(0);
    },
  );

  it.each(['9:30', '24:00', '12:60'])(
    'rejects %s when creating a template',
    async (horarioInicio) => {
      const dto = plainToInstance(CreateRoutineTemplateDto, {
        ...validTemplate,
        horarioInicio,
      });

      expect(await validate(dto)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ property: 'horarioInicio' }),
        ]),
      );
    },
  );

  it.each([{}, { horarioInicio: null }, { horarioInicio: '08:15' }])(
    'accepts update payload %p',
    async (payload) => {
      const dto = plainToInstance(UpdateRoutineTemplateDto, payload);

      expect(await validate(dto)).toHaveLength(0);
    },
  );

  it('rejects an invalid time when updating a template', async () => {
    const dto = plainToInstance(UpdateRoutineTemplateDto, {
      horarioInicio: '25:10',
    });

    expect(await validate(dto)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'horarioInicio' }),
      ]),
    );
  });
});
