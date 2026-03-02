/*
  Warnings:

  - You are about to drop the column `animacoes_ativas` on the `children` table. All the data in the column will be lost.
  - You are about to drop the column `criado_em` on the `children` table. All the data in the column will be lost.
  - You are about to drop the column `sons_ativos` on the `children` table. All the data in the column will be lost.
  - You are about to drop the column `vibracao_ativa` on the `children` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "children" DROP COLUMN "animacoes_ativas",
DROP COLUMN "criado_em",
DROP COLUMN "sons_ativos",
DROP COLUMN "vibracao_ativa",
ADD COLUMN     "condicao" TEXT,
ADD COLUMN     "genero" TEXT,
ADD COLUMN     "nivel_suporte" TEXT;

-- AlterTable
ALTER TABLE "client" ALTER COLUMN "pinParental" DROP NOT NULL;

-- AlterTable
ALTER TABLE "routines" ALTER COLUMN "img_tarefa" DROP NOT NULL,
ALTER COLUMN "data_tarefa" DROP NOT NULL;
