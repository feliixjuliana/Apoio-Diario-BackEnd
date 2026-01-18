export class Routine {
  id: string;
  childId: string;
  nomeTarefa: string;
  tempoEstimado: number;
  imgTarefa: string;
  categoria: string;
  recorrente: boolean;
  favorita: boolean;
  dataTarefa: Date;
  usaSubtarefas: boolean;
  prioridade: number;
  criadoEm: Date;

  constructor(partial: Partial<Routine>) {
    Object.assign(this, partial);
  }
}