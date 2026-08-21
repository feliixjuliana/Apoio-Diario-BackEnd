import { FUSO_HORARIO_NEGOCIO, obterMomentoNegocio } from './relogio-negocio';

describe('business clock', () => {
  it('uses America/Recife to determine the civil date and current time', () => {
    expect(FUSO_HORARIO_NEGOCIO).toBe('America/Recife');

    const momento = obterMomentoNegocio(new Date('2026-08-21T02:15:00.000Z'));

    expect(momento).toEqual({
      inicioHoje: new Date('2026-08-20T00:00:00.000Z'),
      inicioAmanha: new Date('2026-08-21T00:00:00.000Z'),
      horarioAtual: '23:15',
    });
  });
});
