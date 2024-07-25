/*
  Warnings:

  - You are about to drop the column `name` on the `meal` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `recipe` table. All the data in the column will be lost.
  - Added the required column `namex` to the `meal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namex` to the `recipe` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `meal` DROP COLUMN `name`,
    ADD COLUMN `namex` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `recipe` DROP COLUMN `name`,
    ADD COLUMN `namex` VARCHAR(191) NOT NULL;
