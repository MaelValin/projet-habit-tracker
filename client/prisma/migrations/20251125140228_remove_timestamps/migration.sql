/*
  Warnings:

  - You are about to drop the column `createdAt` on the `habit_instances` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `habit_instances` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `habits` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `habits` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "habit_instances" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "habits" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";
