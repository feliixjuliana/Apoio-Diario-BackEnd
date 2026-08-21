import { reconciliarOrdemCronologica } from './prioridade-routines';

describe('routine priority reconciliation', () => {
  it('places 10:00 before 15:00 while preserving slots without a time', () => {
    expect(
      reconciliarOrdemCronologica([
        { id: '15h', prioridade: 1, horarioInicio: '15:00' },
        { id: 'livre', prioridade: 2, horarioInicio: null },
        { id: '10h', prioridade: 3, horarioInicio: '10:00' },
      ]),
    ).toEqual([
      { id: '10h', prioridade: 1 },
      { id: 'livre', prioridade: 2 },
      { id: '15h', prioridade: 3 },
    ]);
  });

  it('uses the previous priority to break equal-time ties', () => {
    expect(
      reconciliarOrdemCronologica([
        { id: 'segundo', prioridade: 2, horarioInicio: '10:00' },
        { id: 'primeiro', prioridade: 1, horarioInicio: '10:00' },
      ]),
    ).toEqual([
      { id: 'primeiro', prioridade: 1 },
      { id: 'segundo', prioridade: 2 },
    ]);
  });

  it('allows activities without a time before, between and after timed slots', () => {
    expect(
      reconciliarOrdemCronologica([
        { id: 'antes', prioridade: 1, horarioInicio: null },
        { id: '18h', prioridade: 2, horarioInicio: '18:00' },
        { id: 'entre', prioridade: 3, horarioInicio: null },
        { id: '08h', prioridade: 4, horarioInicio: '08:00' },
        { id: 'depois', prioridade: 5, horarioInicio: null },
      ]),
    ).toEqual([
      { id: 'antes', prioridade: 1 },
      { id: '08h', prioridade: 2 },
      { id: 'entre', prioridade: 3 },
      { id: '18h', prioridade: 4 },
      { id: 'depois', prioridade: 5 },
    ]);
  });
});
