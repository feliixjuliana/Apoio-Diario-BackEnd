/*
  Warnings:

  - You are about to drop the column `idade` on the `children` table. All the data in the column will be lost.
  - Added the required column `data_nascimento` to the `children` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "children" DROP COLUMN "idade",
ADD COLUMN     "data_nascimento" TIMESTAMP(3) NOT NULL;
