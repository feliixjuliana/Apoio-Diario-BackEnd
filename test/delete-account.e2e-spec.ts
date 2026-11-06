import { randomUUID } from 'node:crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import { PrismaService } from '../prisma/prisma.service';
import { AppModule } from '../src/app.module';

describe('Exclusão de conta e dados relacionados (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  const userId = randomUUID();
  const otherUserId = randomUUID();
  const childId = randomUUID();
  const routineId = randomUUID();
  const templateId = randomUUID();
  const ruleId = randomUUID();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    const secret =
      app.get(ConfigService).get<string>('jwt.secret') ?? 'default_secret';
    token = jwt.sign({ id: userId }, secret, { expiresIn: '1h' });

    await prisma.users.createMany({
      data: [
        {
          id: userId,
          email: `${userId}@test.local`,
          senha: await bcrypt.hash('senha-teste', 4),
          pinParental: 1234,
        },
        {
          id: otherUserId,
          email: `${otherUserId}@test.local`,
          pinParental: 1234,
        },
      ],
    });
    await prisma.children.create({
      data: {
        id: childId,
        usuarioId: userId,
        nome: 'Perfil de teste',
        dataNascimento: new Date('2020-01-01T00:00:00Z'),
      },
    });
    await prisma.routine.create({
      data: {
        id: routineId,
        childId,
        nomeTarefa: 'Rotina de teste',
        subtarefas: { create: { nomeTarefa: 'Subtarefa', ordem: 0 } },
      },
    });
    await prisma.routine_template.create({
      data: {
        id: templateId,
        childId,
        nomeTarefa: 'Modelo de teste',
        subtarefas: { create: { nomeTarefa: 'Subtarefa', ordem: 0 } },
      },
    });
    await prisma.routine_recurrence_rule.create({
      data: {
        id: ruleId,
        childId,
        nomeTarefa: 'Regra de teste',
        diasSemana: [1],
        subtarefas: { create: { nomeTarefa: 'Subtarefa', ordem: 0 } },
      },
    });
  });

  afterAll(async () => {
    if (prisma)
      await prisma.users.deleteMany({
        where: { id: { in: [userId, otherUserId] } },
      });
    if (app) await app.close();
  });

  it('remove os registros relacionados, preserva outra conta e invalida o token', async () => {
    await request(app.getHttpServer())
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'senha-teste' })
      .expect(204);

    expect(await prisma.users.findUnique({ where: { id: userId } })).toBeNull();
    expect(
      await prisma.children.findUnique({ where: { id: childId } }),
    ).toBeNull();
    expect(
      await prisma.routine.findUnique({ where: { id: routineId } }),
    ).toBeNull();
    expect(await prisma.subtask.count({ where: { routineId } })).toBe(0);
    expect(
      await prisma.routine_template.findUnique({ where: { id: templateId } }),
    ).toBeNull();
    expect(await prisma.template_subtask.count({ where: { templateId } })).toBe(
      0,
    );
    expect(
      await prisma.routine_recurrence_rule.findUnique({
        where: { id: ruleId },
      }),
    ).toBeNull();
    expect(await prisma.recurrence_subtask.count({ where: { ruleId } })).toBe(
      0,
    );
    expect(
      await prisma.users.findUnique({ where: { id: otherUserId } }),
    ).not.toBeNull();

    await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });
});
