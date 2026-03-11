/*
  Warnings:

  - You are about to drop the column `favorita` on the `routine_recurrence_rules` table. All the data in the column will be lost.
  - You are about to drop the column `favorita` on the `routine_templates` table. All the data in the column will be lost.
  - You are about to drop the column `favorita` on the `routines` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[recurrence_rule_id,data_tarefa]` on the table `routines` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "routine_recurrence_rules" DROP COLUMN "favorita";

-- AlterTable
ALTER TABLE "routine_templates" DROP COLUMN "favorita";

-- AlterTable
ALTER TABLE "routines" DROP COLUMN "favorita";

-- CreateIndex
CREATE UNIQUE INDEX "routines_recurrence_rule_id_data_tarefa_key" ON "routines"("recurrence_rule_id", "data_tarefa");
