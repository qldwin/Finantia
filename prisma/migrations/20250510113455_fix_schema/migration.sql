/*
  Warnings:

  - You are about to drop the column `createdAd` on the `HistoryTransact` table. All the data in the column will be lost.
  - You are about to drop the column `creadtedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_AccountToHistoryTransact` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AccountToHistoryTransact" DROP CONSTRAINT "_AccountToHistoryTransact_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccountToHistoryTransact" DROP CONSTRAINT "_AccountToHistoryTransact_B_fkey";

-- AlterTable
ALTER TABLE "HistoryTransact" DROP COLUMN "createdAd",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "creadtedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "_AccountToHistoryTransact";

-- AddForeignKey
ALTER TABLE "HistoryTransact" ADD CONSTRAINT "HistoryTransact_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
