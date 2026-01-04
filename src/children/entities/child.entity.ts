import { randomUUID } from 'crypto';

export class Child {
  id: string;
  userId: string;
  nome: string;
  idade: number;
  sonsAtivos: boolean;
  vibracaoAtiva: boolean;
  animacoesAtivas: boolean;
  createdAt: Date;

  constructor(partial: Partial<Child>) {
    this.id = partial.id || randomUUID();
    this.userId = partial.userId!;
    this.nome = partial.nome!;
    this.idade = partial.idade!;
    this.sonsAtivos = partial.sonsAtivos ?? true;
    this.vibracaoAtiva = partial.vibracaoAtiva ?? true;
    this.animacoesAtivas = partial.animacoesAtivas ?? true;
    this.createdAt = partial.createdAt || new Date();
  }
}