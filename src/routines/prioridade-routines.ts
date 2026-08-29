import type { Prisma } from '@prisma/client';

export interface RotinaOrdenavel {
  id: string;
  prioridade: number;
}

export interface PrioridadeReconciliada {
  id: string;
  prioridade: number;
}

export function normalizarOrdemPorPrioridade(
  rotinas: RotinaOrdenavel[],
): PrioridadeReconciliada[] {
  return [...rotinas]
    .sort((a, b) => a.prioridade - b.prioridade || a.id.localeCompare(b.id))
    .map((rotina, index) => ({
      id: rotina.id,
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
    },
    orderBy: [{ prioridade: 'asc' }, { criadoEm: 'asc' }, { id: 'asc' }],
  });
  const prioridades = normalizarOrdemPorPrioridade(rotinas);

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
