/*
  Warnings:

  - You are about to drop the column `GI` on the `meal` table. All the data in the column will be lost.
  - You are about to drop the column `calories` on the `meal` table. All the data in the column will be lost.
  - You are about to drop the column `carb` on the `meal` table. All the data in the column will be lost.
  - You are about to drop the column `desc1` on the `meal` table. All the data in the column will be lost.
  - You are about to drop the column `desc2` on the `meal` table. All the data in the column will be lost.
  - You are about to drop the column `fat` on the `meal` table. All the data in the column will be lost.
  - You are about to drop the column `fiber` on the `meal` table. All the data in the column will be lost.
  - You are about to drop the column `portion` on the `meal` table. All the data in the column will be lost.
  - You are about to drop the column `protein` on the `meal` table. All the data in the column will be lost.
  - You are about to drop the column `totalRowId` on the `meal` table. All the data in the column will be lost.
  - You are about to drop the column `fiber` on the `recipe` table. All the data in the column will be lost.
  - You are about to drop the column `calories` on the `totalrowmeal` table. All the data in the column will be lost.
  - You are about to drop the column `carb` on the `totalrowmeal` table. All the data in the column will be lost.
  - You are about to drop the column `datex` on the `totalrowmeal` table. All the data in the column will be lost.
  - You are about to drop the column `desc1` on the `totalrowmeal` table. All the data in the column will be lost.
  - You are about to drop the column `desc2` on the `totalrowmeal` table. All the data in the column will be lost.
  - You are about to drop the column `fat` on the `totalrowmeal` table. All the data in the column will be lost.
  - You are about to drop the column `fiber` on the `totalrowmeal` table. All the data in the column will be lost.
  - You are about to drop the column `meal_tableId` on the `totalrowmeal` table. All the data in the column will be lost.
  - You are about to drop the column `portion` on the `totalrowmeal` table. All the data in the column will be lost.
  - You are about to drop the column `protein` on the `totalrowmeal` table. All the data in the column will be lost.
  - You are about to drop the column `calories` on the `totalrowrecipe` table. All the data in the column will be lost.
  - You are about to drop the column `carb` on the `totalrowrecipe` table. All the data in the column will be lost.
  - You are about to drop the column `desc1` on the `totalrowrecipe` table. All the data in the column will be lost.
  - You are about to drop the column `desc2` on the `totalrowrecipe` table. All the data in the column will be lost.
  - You are about to drop the column `fat` on the `totalrowrecipe` table. All the data in the column will be lost.
  - You are about to drop the column `fiber` on the `totalrowrecipe` table. All the data in the column will be lost.
  - You are about to drop the column `portion` on the `totalrowrecipe` table. All the data in the column will be lost.
  - You are about to drop the column `protein` on the `totalrowrecipe` table. All the data in the column will be lost.
  - You are about to drop the column `recipe_tableId` on the `totalrowrecipe` table. All the data in the column will be lost.
  - Added the required column `details` to the `meal` table without a default value. This is not possible if the table is not empty.
  - Made the column `datex` on table `meal` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `GI` to the `recipe` table without a default value. This is not possible if the table is not empty.
  - Made the column `desc1` on table `recipe` required. This step will fail if there are existing NULL values in that column.
  - Made the column `desc2` on table `recipe` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `caloriesTot` to the `totalrowmeal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carbTot` to the `totalrowmeal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatTot` to the `totalrowmeal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fiberTot` to the `totalrowmeal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proteinTot` to the `totalrowmeal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalRowId` to the `totalrowmeal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `caloriesTot` to the `totalrowrecipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carbTot` to the `totalrowrecipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatTot` to the `totalrowrecipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fiberTot` to the `totalrowrecipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proteinTot` to the `totalrowrecipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipeId` to the `totalrowrecipe` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `totalrowmeal` DROP FOREIGN KEY `totalrowmeal_meal_tableId_fkey`;

-- DropForeignKey
ALTER TABLE `totalrowrecipe` DROP FOREIGN KEY `totalrowRecipe_recipe_tableId_fkey`;

-- DropIndex
DROP INDEX `meal_totalRowId_key` ON `meal`;

-- AlterTable
ALTER TABLE `meal` DROP COLUMN `GI`,
    DROP COLUMN `calories`,
    DROP COLUMN `carb`,
    DROP COLUMN `desc1`,
    DROP COLUMN `desc2`,
    DROP COLUMN `fat`,
    DROP COLUMN `fiber`,
    DROP COLUMN `portion`,
    DROP COLUMN `protein`,
    DROP COLUMN `totalRowId`,
    ADD COLUMN `details` JSON NOT NULL,
    MODIFY `datex` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `recipe` DROP COLUMN `fiber`,
    ADD COLUMN `GI` DOUBLE NOT NULL,
    MODIFY `desc1` VARCHAR(191) NOT NULL,
    MODIFY `desc2` VARCHAR(191) NOT NULL,
    ALTER COLUMN `portion` DROP DEFAULT;

-- AlterTable
ALTER TABLE `totalrowmeal` DROP COLUMN `calories`,
    DROP COLUMN `carb`,
    DROP COLUMN `datex`,
    DROP COLUMN `desc1`,
    DROP COLUMN `desc2`,
    DROP COLUMN `fat`,
    DROP COLUMN `fiber`,
    DROP COLUMN `meal_tableId`,
    DROP COLUMN `portion`,
    DROP COLUMN `protein`,
    ADD COLUMN `caloriesTot` DOUBLE NOT NULL,
    ADD COLUMN `carbTot` DOUBLE NOT NULL,
    ADD COLUMN `fatTot` DOUBLE NOT NULL,
    ADD COLUMN `fiberTot` DOUBLE NOT NULL,
    ADD COLUMN `portionTot` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `proteinTot` DOUBLE NOT NULL,
    ADD COLUMN `totalRowId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `totalrowrecipe` DROP COLUMN `calories`,
    DROP COLUMN `carb`,
    DROP COLUMN `desc1`,
    DROP COLUMN `desc2`,
    DROP COLUMN `fat`,
    DROP COLUMN `fiber`,
    DROP COLUMN `portion`,
    DROP COLUMN `protein`,
    DROP COLUMN `recipe_tableId`,
    ADD COLUMN `caloriesTot` DOUBLE NOT NULL,
    ADD COLUMN `carbTot` DOUBLE NOT NULL,
    ADD COLUMN `fatTot` DOUBLE NOT NULL,
    ADD COLUMN `fiberTot` DOUBLE NOT NULL,
    ADD COLUMN `portionTot` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `proteinTot` DOUBLE NOT NULL,
    ADD COLUMN `recipeId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `totalrowmealId_fkey` ON `totalrowmeal`(`totalRowId`);

-- CreateIndex
CREATE INDEX `recipeTotalRow_tableId_fkey` ON `totalrowrecipe`(`recipeId`);

-- AddForeignKey
ALTER TABLE `totalrowmeal` ADD CONSTRAINT `totalrowmeal_totalRowId_fkey` FOREIGN KEY (`totalRowId`) REFERENCES `meal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `totalrowrecipe` ADD CONSTRAINT `totalrowrecipe_recipeId_fkey` FOREIGN KEY (`recipeId`) REFERENCES `recipe`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
