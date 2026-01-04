import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async save(user: User): Promise<User> {
    const query = `INSERT INTO users (id, email, password, created_at) VALUES ($1, $2, $3, $4)`;
    await this.pool.query(query, [user.id, user.email, user.password, user.createdAt]);
    return user;
  }

  async update(user: User): Promise<User> {
    const query = `UPDATE users SET password = $1, reset_token = $2, reset_expires = $3 WHERE id = $4`;
    await this.pool.query(query, [user.password, user.resetToken, user.resetExpires, user.id]);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ? this.mapToModel(result.rows[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ? this.mapToModel(result.rows[0]) : null;
  }

  async getAll(): Promise<User[]> {
    const result = await this.pool.query('SELECT * FROM users');
    return result.rows.map(this.mapToModel);
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
}