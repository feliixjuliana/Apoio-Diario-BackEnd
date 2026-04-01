/*
  Warnings:

  - You are about to drop the column `ordem` on the `routine_templates` table. All the data in the column will be lost.
  - Added the required column `ordem` to the `subtask` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "routine_templates" DROP COLUMN "ordem";

-- AlterTable
ALTER TABLE "subtask" ADD COLUMN     "ordem" INTEGER NOT NULL;
