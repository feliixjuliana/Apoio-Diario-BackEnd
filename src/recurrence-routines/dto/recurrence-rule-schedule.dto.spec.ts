import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateRecurrenceRuleDto } from './create-recurrence-rule.dto';
import { UpdateRecurrenceRuleDto } from './update-recurrence-rule.dto';

const validRule = {
  childId: 'child-id',
  nomeTarefa: 'Tomar medicação',
  diasSemana: [2, 4, 6],
  dataInicio: '2026-08-21',
};

describe('recurrence rule schedule validation', () => {
  it.each([undefined, null, '00:00', '02:00', '23:59'])(
    'accepts horarioInicio %p on creation',
    async (horarioInicio) => {
      const dto = plainToInstance(CreateRecurrenceRuleDto, {
        ...validRule,
        horarioInicio,
      });

      expect(await validate(dto)).toHaveLength(0);
    },
  );

  it('requires dataInicio on creation', async () => {
    const { dataInicio, ...payload } = validRule;
    const dto = plainToInstance(CreateRecurrenceRuleDto, payload);

    expect(await validate(dto)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'dataInicio' }),
      ]),
    );
  });

  it('rejects the removed favorita field', async () => {
    const dto = plainToInstance(CreateRecurrenceRuleDto, {
      ...validRule,
      favorita: true,
    });

    expect(
      await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'favorita' }),
      ]),
    );
  });

  it.each(['2026-8-21', '2026-02-30', '2026-08-21T00:00:00Z'])(
    'rejects invalid dataInicio %s',
    async (dataInicio) => {
      const dto = plainToInstance(CreateRecurrenceRuleDto, {
        ...validRule,
        dataInicio,
      });

      expect(await validate(dto)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ property: 'dataInicio' }),
        ]),
      );
    },
  );

  it.each(['9:30', '24:00', '12:60'])(
    'rejects invalid horarioInicio %s',
    async (horarioInicio) => {
      const dto = plainToInstance(CreateRecurrenceRuleDto, {
        ...validRule,
        horarioInicio,
      });

      expect(await validate(dto)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ property: 'horarioInicio' }),
        ]),
      );
    },
  );

  it.each([
    {},
    { dataInicio: '2026-09-01' },
    { horarioInicio: null },
    { horarioInicio: '18:30' },
  ])('accepts update payload %p', async (payload) => {
    const dto = plainToInstance(UpdateRecurrenceRuleDto, payload);

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects null dataInicio on update', async () => {
    const dto = plainToInstance(UpdateRecurrenceRuleDto, {
      dataInicio: null,
    });

    expect(await validate(dto)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'dataInicio' }),
      ]),
    );
  });
});
