import { parseDataCivil } from './data-civil';

export const FUSO_HORARIO_NEGOCIO = 'America/Recife';

type ParteData = 'year' | 'month' | 'day' | 'hour' | 'minute';

export interface MomentoNegocio {
  inicioHoje: Date;
  inicioAmanha: Date;
  horarioAtual: string;
}

export function obterMomentoNegocio(agora = new Date()): MomentoNegocio {
  const formatador = new Intl.DateTimeFormat('en-US', {
    timeZone: FUSO_HORARIO_NEGOCIO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const partes = Object.fromEntries(
    formatador
      .formatToParts(agora)
      .filter((parte) => parte.type !== 'literal')
      .map((parte) => [parte.type, parte.value]),
  ) as Record<ParteData, string>;

  const dataCivil = `${partes.year}-${partes.month}-${partes.day}`;
  const inicioHoje = parseDataCivil(dataCivil);
  const inicioAmanha = new Date(inicioHoje);
  inicioAmanha.setUTCDate(inicioAmanha.getUTCDate() + 1);

  return {
    inicioHoje,
    inicioAmanha,
    horarioAtual: `${partes.hour}:${partes.minute}`,
  };
}
