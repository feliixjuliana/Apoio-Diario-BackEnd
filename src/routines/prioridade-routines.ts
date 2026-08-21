import type { Prisma } from '@prisma/client';

export interface RotinaOrdenavel {
  id: string;
  prioridade: number;
  horarioInicio: string | null;
}

export interface PrioridadeReconciliada {
  id: string;
  prioridade: number;
}

export function reconciliarOrdemCronologica(
  rotinas: RotinaOrdenavel[],
): PrioridadeReconciliada[] {
  const ordemAnterior = [...rotinas].sort(
    (a, b) => a.prioridade - b.prioridade || a.id.localeCompare(b.id),
  );
  const comHorario = ordemAnterior
    .filter(
      (rotina): rotina is RotinaOrdenavel & { horarioInicio: string } =>
        rotina.horarioInicio !== null,
    )
    .sort(
      (a, b) =>
        a.horarioInicio.localeCompare(b.horarioInicio) ||
        a.prioridade - b.prioridade ||
        a.id.localeCompare(b.id),
    );

  let indiceComHorario = 0;

  return ordemAnterior.map((posicaoAnterior, index) => ({
    id:
      posicaoAnterior.horarioInicio === null
        ? posicaoAnterior.id
        : comHorario[indiceComHorario++].id,
    prioridade: index + 1,
  }));
}

export function chaveDataTarefa(data: Date): string {
  return data.toISOString().slice(0, 10);
}

export function limitesDaDataTarefa(data: Date) {
  const inicio = new Date(`${chaveDataTarefa(data)}T00:00:00.000Z`);
  const fim = new Date(inicio);
  fim.setUTCDate(fim.getUTCDate() + 1);

  return { inicio, fim };
}

export async function reconciliarPrioridadesDoDia(
  tx: Prisma.TransactionClient,
  childId: string,
  dataTarefa: Date,
) {
  const { inicio, fim } = limitesDaDataTarefa(dataTarefa);
  const rotinas = await tx.routine.findMany({
    where: {
      childId,
      dataTarefa: { gte: inicio, lt: fim },
    },
    select: {
      id: true,
      prioridade: true,
      horarioInicio: true,
    },
    orderBy: [{ prioridade: 'asc' }, { criadoEm: 'asc' }, { id: 'asc' }],
  });
  const prioridades = reconciliarOrdemCronologica(rotinas);

  for (const item of prioridades) {
    const rotina = rotinas.find((candidata) => candidata.id === item.id);
    if (rotina?.prioridade !== item.prioridade) {
      await tx.routine.update({
        where: { id: item.id },
        data: { prioridade: item.prioridade },
      });
    }
  }

  return prioridades;
}
