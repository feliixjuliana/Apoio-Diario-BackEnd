import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { Child } from './entities/child.entity';

@Injectable()
export class ChildrenRepository {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async create(child: Child): Promise<Child> {
    const query = `
      INSERT INTO children (id, user_id, nome, idade, sons_ativos, vibracao_ativa, animacoes_ativas, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`;
    const values = [child.id, child.userId, child.nome, child.idade, child.sonsAtivos, child.vibracaoAtiva, child.animacoesAtivas, child.createdAt];
    await this.pool.query(query, values);
    return child;
  }

  async findByUserId(userId: string): Promise<Child[]> {
    const res = await this.pool.query('SELECT * FROM children WHERE user_id = $1', [userId]);
    return res.rows.map(row => this.mapToEntity(row));
  }

  async findById(id: string): Promise<Child | null> {
    const res = await this.pool.query('SELECT * FROM children WHERE id = $1', [id]);
    return res.rows[0] ? this.mapToEntity(res.rows[0]) : null;
  }

  async update(id: string, data: Partial<Child>): Promise<void> {
    const query = `
      UPDATE children 
      SET nome = COALESCE($1, nome), 
          idade = COALESCE($2, idade), 
          sons_ativos = COALESCE($3, sons_ativos), 
          vibracao_ativa = COALESCE($4, vibracao_ativa), 
          animacoes_ativas = COALESCE($5, animacoes_ativas)
      WHERE id = $6`;
    await this.pool.query(query, [data.nome, data.idade, data.sonsAtivos, data.vibracaoAtiva, data.animacoesAtivas, id]);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM children WHERE id = $1', [id]);
  }

  private mapToEntity(row: any): Child {
    return new Child({
      id: row.id,
      userId: row.user_id,
      nome: row.nome,
      idade: row.idade,
      sonsAtivos: row.sons_ativos,
      vibracaoAtiva: row.vibracao_ativa,
      animacoesAtivas: row.animacoes_ativas,
      createdAt: row.created_at,
    });
  }
}