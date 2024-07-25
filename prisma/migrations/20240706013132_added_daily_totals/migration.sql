/*
  Warnings:

  - Added the required column `day` to the `daily_totals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `daily_totals` ADD COLUMN `day` DATETIME(3) NOT NULL;
