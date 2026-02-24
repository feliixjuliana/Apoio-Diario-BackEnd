/*
  Warnings:

  - You are about to drop the column `categoria` on the `routines` table. All the data in the column will be lost.
  - You are about to drop the column `dias_semana` on the `routines` table. All the data in the column will be lost.
  - You are about to drop the column `recorrente` on the `routines` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "routines" DROP COLUMN "categoria",
DROP COLUMN "dias_semana",
DROP COLUMN "recorrente",
ALTER COLUMN "duracao_minutos" DROP NOT NULL,
ALTER COLUMN "horario_inicio" DROP NOT NULL;

-- CreateTable
CREATE TABLE "routine_templates" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "nome_tarefa" TEXT NOT NULL,
    "duracao_minutos" DOUBLE PRECISION,
    "horario_inicio" TEXT,
    "img_tarefa" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "favorita" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routine_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_subtask" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "nomeTarefa" TEXT NOT NULL,
    "imgTarefa" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_subtask_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "routine_templates" ADD CONSTRAINT "routine_templates_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_subtask" ADD CONSTRAINT "template_subtask_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "routine_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
