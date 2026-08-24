import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../prisma/prisma.service';
import { AppModule } from '../src/app.module';

describe('Routine templates ownership (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let tokenA: string;
  const suffix = randomUUID();
  const userAId = randomUUID();
  const userBId = randomUUID();
  const childAId = randomUUID();
  const childBId = randomUUID();
  const templateDeleteAId = randomUUID();
  const templatePatchAId = randomUUID();
  const templateBId = randomUUID();
  const missingChildId = randomUUID();
  const missingTemplateId = randomUUID();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get(PrismaService);
    const config = app.get(ConfigService);
    const secret = config.get<string>('jwt.secret') ?? 'default_secret';
    tokenA = jwt.sign({ id: userAId }, secret, { expiresIn: '1h' });

    await prisma.users.createMany({
      data: [
        {
          id: userAId,
          email: `ownership-a-${suffix}@test.local`,
          pinParental: 1234,
        },
        {
          id: userBId,
          email: `ownership-b-${suffix}@test.local`,
          pinParental: 1234,
        },
      ],
    });
    await prisma.children.createMany({
      data: [
        {
          id: childAId,
          usuarioId: userAId,
          nome: 'Criança A',
          dataNascimento: new Date('2018-01-01T00:00:00.000Z'),
        },
        {
          id: childBId,
          usuarioId: userBId,
          nome: 'Criança B',
          dataNascimento: new Date('2018-01-01T00:00:00.000Z'),
        },
      ],
    });
    await prisma.routine_template.createMany({
      data: [
        {
          id: templateDeleteAId,
          childId: childAId,
          nomeTarefa: 'Template A para excluir',
        },
        {
          id: templatePatchAId,
          childId: childAId,
          nomeTarefa: 'Template A para editar',
        },
        {
          id: templateBId,
          childId: childBId,
          nomeTarefa: 'Template B protegido',
        },
      ],
    });
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.users.deleteMany({
        where: { id: { in: [userAId, userBId] } },
      });
    }
    if (app) await app.close();
  });

  it('allows user A to list templates from child A', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/routine-templates/${childAId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: templateDeleteAId }),
        expect.objectContaining({ id: templatePatchAId }),
      ]),
    );
    expect(response.body).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: templateBId })]),
    );
  });

  it('returns the same safe 404 for another user child and a missing child', async () => {
    const unauthorized = await request(app.getHttpServer())
      .get(`/api/routine-templates/${childBId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404);
    const missing = await request(app.getHttpServer())
      .get(`/api/routine-templates/${missingChildId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404);

    expect(unauthorized.body.message).toBe('Criança não encontrada');
    expect(missing.body.message).toBe(unauthorized.body.message);
  });

  it('allows user A to delete an owned template', async () => {
    await request(app.getHttpServer())
      .delete(`/api/routine-templates/${templateDeleteAId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect({ message: 'Template removido com sucesso' });

    await expect(
      prisma.routine_template.findUnique({
        where: { id: templateDeleteAId },
      }),
    ).resolves.toBeNull();
  });

  it('does not delete another user template and uses the same 404 as a missing ID', async () => {
    const unauthorized = await request(app.getHttpServer())
      .delete(`/api/routine-templates/${templateBId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404);
    const missing = await request(app.getHttpServer())
      .delete(`/api/routine-templates/${missingTemplateId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404);

    expect(unauthorized.body.message).toBe('Template não encontrado');
    expect(missing.body.message).toBe(unauthorized.body.message);
    await expect(
      prisma.routine_template.findUnique({ where: { id: templateBId } }),
    ).resolves.toEqual(expect.objectContaining({ id: templateBId }));
  });

  it('keeps authorized PATCH working and hides unauthorized template existence', async () => {
    await request(app.getHttpServer())
      .patch(`/api/routine-templates/${templatePatchAId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ nomeTarefa: 'Template A atualizado' })
      .expect(200);

    const unauthorized = await request(app.getHttpServer())
      .patch(`/api/routine-templates/${templateBId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ nomeTarefa: 'Tentativa indevida' })
      .expect(404);

    expect(unauthorized.body.message).toBe('Template não encontrado');
    await expect(
      prisma.routine_template.findUnique({ where: { id: templateBId } }),
    ).resolves.toEqual(
      expect.objectContaining({ nomeTarefa: 'Template B protegido' }),
    );
  });
});
