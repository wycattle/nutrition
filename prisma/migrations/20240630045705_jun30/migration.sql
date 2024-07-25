/*
  Warnings:

  - You are about to drop the column `GI` on the `recipe` table. All the data in the column will be lost.
  - You are about to drop the column `calories` on the `recipe` table. All the data in the column will be lost.
  - You are about to drop the column `carb` on the `recipe` table. All the data in the column will be lost.
  - You are about to drop the column `desc1` on the `recipe` table. All the data in the column will be lost.
  - You are about to drop the column `desc2` on the `recipe` table. All the data in the column will be lost.
  - You are about to drop the column `fat` on the `recipe` table. All the data in the column will be lost.
  - You are about to drop the column `portion` on the `recipe` table. All the data in the column will be lost.
  - You are about to drop the column `protein` on the `recipe` table. All the data in the column will be lost.
  - You are about to drop the column `totalRowId` on the `totalrowmeal` table. All the data in the column will be lost.
  - You are about to drop the column `recipeId` on the `totalrowrecipe` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[totalRowId]` on the table `meal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[totalRowId]` on the table `recipe` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mealId]` on the table `totalrowmeal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[recipexId]` on the table `totalrowrecipe` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `details` to the `recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mealId` to the `totalrowmeal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipexId` to the `totalrowrecipe` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `totalrowmeal` DROP FOREIGN KEY `totalrowmeal_totalRowId_fkey`;

-- DropForeignKey
ALTER TABLE `totalrowrecipe` DROP FOREIGN KEY `totalrowrecipe_recipeId_fkey`;

-- AlterTable
ALTER TABLE `meal` ADD COLUMN `totalRowId` INTEGER NULL;

-- AlterTable
ALTER TABLE `recipe` DROP COLUMN `GI`,
    DROP COLUMN `calories`,
    DROP COLUMN `carb`,
    DROP COLUMN `desc1`,
    DROP COLUMN `desc2`,
    DROP COLUMN `fat`,
    DROP COLUMN `portion`,
    DROP COLUMN `protein`,
    ADD COLUMN `details` JSON NOT NULL,
    ADD COLUMN `totalRowId` INTEGER NULL;

-- AlterTable
ALTER TABLE `totalrowmeal` DROP COLUMN `totalRowId`,
    ADD COLUMN `mealId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `totalrowrecipe` DROP COLUMN `recipeId`,
    ADD COLUMN `recipexId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `meal_totalRowId_key` ON `meal`(`totalRowId`);

-- CreateIndex
CREATE UNIQUE INDEX `recipe_totalRowId_key` ON `recipe`(`totalRowId`);

-- CreateIndex
CREATE UNIQUE INDEX `totalrowmeal_mealId_key` ON `totalrowmeal`(`mealId`);

-- CreateIndex
CREATE UNIQUE INDEX `totalrowrecipe_recipexId_key` ON `totalrowrecipe`(`recipexId`);

-- AddForeignKey
ALTER TABLE `totalrowmeal` ADD CONSTRAINT `totalrowmeal_mealId_fkey` FOREIGN KEY (`mealId`) REFERENCES `meal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `totalrowrecipe` ADD CONSTRAINT `totalrowrecipe_recipexId_fkey` FOREIGN KEY (`recipexId`) REFERENCES `recipe`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
