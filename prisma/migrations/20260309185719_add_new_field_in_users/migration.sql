/*
  Warnings:

  - Made the column `pinParental` on table `client` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "client" ADD COLUMN     "controle_parental_ativo" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "pinParental" SET NOT NULL;
