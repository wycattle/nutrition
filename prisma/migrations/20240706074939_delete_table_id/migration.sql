/*
  Warnings:

  - You are about to drop the column `dailyTotalsId` on the `daily_totals` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `daily_totals_dailyTotalsId_key` ON `daily_totals`;

-- AlterTable
ALTER TABLE `daily_totals` DROP COLUMN `dailyTotalsId`;
