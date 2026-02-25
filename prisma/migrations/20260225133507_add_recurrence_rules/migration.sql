/*
  Warnings:

  - You are about to drop the column `horario_inicio` on the `routine_templates` table. All the data in the column will be lost.
  - You are about to drop the column `horario_inicio` on the `routines` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "routine_templates" DROP COLUMN "horario_inicio";

-- AlterTable
ALTER TABLE "routines" DROP COLUMN "horario_inicio",
ADD COLUMN     "recurrence_rule_id" TEXT;

-- CreateTable
CREATE TABLE "routine_recurrence_rules" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "nome_tarefa" TEXT NOT NULL,
    "duracao_minutos" DOUBLE PRECISION,
    "img_tarefa" TEXT NOT NULL,
    "favorita" BOOLEAN NOT NULL DEFAULT false,
    "dias_semana" INTEGER[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routine_recurrence_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurrence_subtask" (
    "id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "nomeTarefa" TEXT NOT NULL,
    "imgTarefa" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurrence_subtask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "routines_recurrence_rule_id_idx" ON "routines"("recurrence_rule_id");

-- AddForeignKey
ALTER TABLE "routines" ADD CONSTRAINT "routines_recurrence_rule_id_fkey" FOREIGN KEY ("recurrence_rule_id") REFERENCES "routine_recurrence_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_recurrence_rules" ADD CONSTRAINT "routine_recurrence_rules_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrence_subtask" ADD CONSTRAINT "recurrence_subtask_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "routine_recurrence_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
