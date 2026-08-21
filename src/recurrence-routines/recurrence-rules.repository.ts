import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecurrenceRuleDto } from '../recurrence-routines/dto/create-recurrence-rule.dto';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateRecurrenceRuleDto } from './dto/update-recurrence-rule.dto';
import { parseDataCivil } from '../common/date/data-civil';
import { obterMomentoNegocio } from '../common/date/relogio-negocio';
import {
  chaveDataTarefa,
  reconciliarPrioridadesDoDia,
} from '../routines/prioridade-routines';

@Injectable()
export class RecurrenceRulesRepository {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateRecurrenceRuleDto) {
    const { subtarefas, dataInicio, ...data } = dto;

    return this.prisma.routine_recurrence_rule.create({
      data: {
        ...data,
        dataInicio: parseDataCivil(dataInicio),
        subtarefas: {
          create: subtarefas?.map((s, index) => ({
            nomeTarefa: s.nomeTarefa,
            imgTarefa: s.imgTarefa,
            ordem: index,
          })),
        },
      },
      include: { subtarefas: { orderBy: { ordem: 'asc' } } },
    });
  }

  findByChild(childId: string) {
    return this.prisma.routine_recurrence_rule.findMany({
      where: { childId, ativo: true },
      include: { subtarefas: { orderBy: { ordem: 'asc' } } },
      orderBy: { criadoEm: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.routine_recurrence_rule.findUnique({
      where: { id },
      include: { subtarefas: { orderBy: { ordem: 'asc' } }, crianca: true },
    });
  }

  async updateRuleTransaction(
    id: string,
    dto: UpdateRecurrenceRuleDto,
    agora = new Date(),
  ) {
    const { subtarefas, dataInicio, ...data } = dto;
    const dadosRegra =
      dataInicio === undefined
        ? data
        : { ...data, dataInicio: parseDataCivil(dataInicio) };

    return this.prisma.$transaction(async (tx) => {
      await tx.routine_recurrence_rule.update({
        where: { id },
        data: dadosRegra,
      });

      if (dto.horarioInicio !== undefined) {
        const { inicioHoje, inicioAmanha, horarioAtual } =
          obterMomentoNegocio(agora);
        const hojeSemHorarioPodeReceberNovoHorario =
          dto.horarioInicio !== null && dto.horarioInicio >= horarioAtual;
        const filtroOcorrencias = {
          recurrenceRuleId: id,
          tarefaCompletada: false,
          OR: [
            {
              dataTarefa: { gte: inicioAmanha },
            },
            {
              dataTarefa: { gte: inicioHoje, lt: inicioAmanha },
              OR: [
                { horarioInicio: { gte: horarioAtual } },
                ...(hojeSemHorarioPodeReceberNovoHorario
                  ? [{ horarioInicio: null }]
                  : []),
              ],
            },
          ],
        };
        const ocorrenciasAfetadas = await tx.routine.findMany({
          where: filtroOcorrencias,
          select: { childId: true, dataTarefa: true },
        });

        await tx.routine.updateMany({
          where: filtroOcorrencias,
          data: { horarioInicio: dto.horarioInicio },
        });

        const diasAfetados = new Map<
          string,
          { childId: string; dataTarefa: Date }
        >();
        for (const ocorrencia of ocorrenciasAfetadas) {
          if (ocorrencia.dataTarefa) {
            const chave = `${ocorrencia.childId}:${chaveDataTarefa(ocorrencia.dataTarefa)}`;
            diasAfetados.set(chave, {
              childId: ocorrencia.childId,
              dataTarefa: ocorrencia.dataTarefa,
            });
          }
        }
        for (const dia of diasAfetados.values()) {
          await reconciliarPrioridadesDoDia(tx, dia.childId, dia.dataTarefa);
        }
      }

      if (subtarefas !== undefined) {
        await tx.recurrence_subtask.deleteMany({
          where: { ruleId: id },
        });

        if (subtarefas.length) {
          await tx.recurrence_subtask.createMany({
            data: subtarefas.map((s, index) => ({
              ruleId: id,
              nomeTarefa: s.nomeTarefa,
              imgTarefa: s.imgTarefa,
              ordem: index,
            })),
          });
        }
      }

      return tx.routine_recurrence_rule.findUnique({
        where: { id },
        include: { subtarefas: { orderBy: { ordem: 'asc' } } },
      });
    });
  }

  async deleteRecurrence(id: string, deleteMode: 'future' | 'all') {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    if (deleteMode === 'future') {
      await this.prisma.routine.deleteMany({
        where: {
          recurrenceRuleId: id,
          dataTarefa: {
            gt: todayStart,
          },
        },
      });
    }

    if (deleteMode === 'all') {
      await this.prisma.routine.deleteMany({
        where: {
          recurrenceRuleId: id,
        },
      });
    }

    await this.prisma.routine_recurrence_rule.delete({
      where: { id },
    });

    return { message: 'Recorrência removida com sucesso' };
  }
}
