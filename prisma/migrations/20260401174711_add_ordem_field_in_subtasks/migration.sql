/*
  Warnings:

  - Added the required column `ordem` to the `recurrence_subtask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ordem` to the `routine_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ordem` to the `template_subtask` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "recurrence_subtask" ADD COLUMN     "ordem" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "routine_templates" ADD COLUMN     "ordem" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "template_subtask" ADD COLUMN     "ordem" INTEGER NOT NULL;
