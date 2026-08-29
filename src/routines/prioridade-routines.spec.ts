import { normalizarOrdemPorPrioridade } from './prioridade-routines';

describe('routine priority reconciliation', () => {
  it('preserves priority order regardless of activity time', () => {
    expect(
      normalizarOrdemPorPrioridade([
        { id: '12h50', prioridade: 1 },
        { id: '14h', prioridade: 2 },
        { id: '11h', prioridade: 3 },
      ]),
    ).toEqual([
      { id: '12h50', prioridade: 1 },
      { id: '14h', prioridade: 2 },
      { id: '11h', prioridade: 3 },
    ]);
  });

  it('normalizes gaps without changing the relative priority order', () => {
    expect(
      normalizarOrdemPorPrioridade([
        { id: 'terceiro', prioridade: 8 },
        { id: 'primeiro', prioridade: 2 },
        { id: 'segundo', prioridade: 5 },
      ]),
    ).toEqual([
      { id: 'primeiro', prioridade: 1 },
      { id: 'segundo', prioridade: 2 },
      { id: 'terceiro', prioridade: 3 },
    ]);
  });

  it('uses the id only as a deterministic tie-breaker', () => {
    expect(
      normalizarOrdemPorPrioridade([
        { id: 'b', prioridade: 1 },
        { id: 'a', prioridade: 1 },
      ]),
    ).toEqual([
      { id: 'a', prioridade: 1 },
      { id: 'b', prioridade: 2 },
    ]);
  });
});
