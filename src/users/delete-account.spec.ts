import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthGuard } from '../auth/auth.guard';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('DELETE /users/me', () => {
  let app: INestApplication;
  let passwordHash: string;
  const secret = 'test-only-secret';
  const users = new Map<string, { id: string; senha: string }>();
  const prisma = {
    users: {
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
        const user = users.get(where.id);
        return user ? { id: user.id } : null;
      }),
    },
  };
  const repository = {
    findById: jest.fn(async (id: string) => users.get(id) ?? null),
    deleteIfPasswordUnchanged: jest.fn(async (id: string, hash: string) => {
      if (users.get(id)?.senha !== hash) return false;
      return users.delete(id);
    }),
  };
  const tokenFor = (id: string) => jwt.sign({ id }, secret);

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('senha-teste', 4);
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        AuthGuard,
        { provide: UsersRepository, useValue: repository },
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { get: () => secret } },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  beforeEach(() => {
    users.clear();
    users.set('user-1', { id: 'user-1', senha: passwordHash });
    users.set('user-2', { id: 'user-2', senha: passwordHash });
    jest.clearAllMocks();
  });

  afterAll(async () => app.close());

  it('exclui somente a conta autenticada e rejeita o token antigo', async () => {
    const token = tokenFor('user-1');
    await request(app.getHttpServer())
      .delete('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'senha-teste' })
      .expect(204);

    expect(users.has('user-1')).toBe(false);
    expect(users.has('user-2')).toBe(true);
    await request(app.getHttpServer())
      .delete('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'senha-teste' })
      .expect(401);
  });

  it('rejeita senha incorreta sem excluir a conta', async () => {
    await request(app.getHttpServer())
      .delete('/users/me')
      .set('Authorization', `Bearer ${tokenFor('user-1')}`)
      .send({ password: 'incorreta' })
      .expect(403);
    expect(repository.deleteIfPasswordUnchanged).not.toHaveBeenCalled();
    expect(users.has('user-1')).toBe(true);
  });

  it('rejeita token ausente e campos de identificador fornecidos pelo cliente', async () => {
    await request(app.getHttpServer())
      .delete('/users/me')
      .send({ password: 'senha-teste' })
      .expect(401);
    await request(app.getHttpServer())
      .delete('/users/me')
      .set('Authorization', `Bearer ${tokenFor('user-1')}`)
      .send({ password: 'senha-teste', id: 'user-2' })
      .expect(400);
    expect(repository.deleteIfPasswordUnchanged).not.toHaveBeenCalled();
  });

  it('não relata sucesso se a senha mudou durante a solicitação', async () => {
    repository.deleteIfPasswordUnchanged.mockResolvedValueOnce(false);
    await request(app.getHttpServer())
      .delete('/users/me')
      .set('Authorization', `Bearer ${tokenFor('user-1')}`)
      .send({ password: 'senha-teste' })
      .expect(403);
    expect(users.has('user-1')).toBe(true);
  });
});
