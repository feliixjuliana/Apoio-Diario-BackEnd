import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { User } from './entities/user.entity';
import { UserWithChildren } from './entities/user-response.dto';

@Injectable()
export class UsersRepository {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async save(user: User): Promise<User> {
    const query = `INSERT INTO users (id, email, password, created_at) VALUES ($1, $2, $3, $4)`;
    await this.pool.query(query, [
      user.id,
      user.email,
      user.password,
      user.createdAt,
    ]);
    return user;
  }

  async update(user: User): Promise<User> {
    const query = `UPDATE users SET password = $1, reset_token = $2, reset_expires = $3 WHERE id = $4`;
    await this.pool.query(query, [
      user.password,
      user.resetToken,
      user.resetExpires,
      user.id,
    ]);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );
    return result.rows[0] ? this.mapToModel(result.rows[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [
      id,
    ]);
    return result.rows[0] ? this.mapToModel(result.rows[0]) : null;
  }

  async getAll(): Promise<UserWithChildren[]> {
    const query = `
    SELECT
      u.id,
      u.email,
      u.created_at,
      u.reset_token,
      u.reset_expires,
      COALESCE(
        json_agg(
          json_build_object(
            'id', c.id,
            'nome', c.nome,
            'idade', c.idade,
            'sons_ativos', c.sons_ativos,
            'vibracao_ativa', c.vibracao_ativa,
            'animacoes_ativas', c.animacoes_ativas,
            'created_at', c.created_at
          )
        ) FILTER (WHERE c.id IS NOT NULL),
        '[]'
      ) AS children
    FROM users u
    LEFT JOIN children c ON c.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC;
    `;
    const result = await this.pool.query(query);
    return result.rows.map(this.mapToModelWithChildren);
  }

  private mapToModel(row: any): User {
    return new User({
      id: row.id,
      email: row.email,
      password: row.password,
      createdAt: row.created_at,
      resetToken: row.reset_token,
      resetExpires: row.reset_expires,
    });
  }

  private mapToModelWithChildren(row: any): UserWithChildren {
    return {
      id: row.id,
      email: row.email,
      createdAt: row.created_at,
      resetToken: row.reset_token,
      resetExpires: row.reset_expires,
      children: row.children ?? [],
    };
  }
}
