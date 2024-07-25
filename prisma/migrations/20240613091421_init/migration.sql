-- CreateTable
CREATE TABLE `meal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `datex` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `desc1` VARCHAR(191) NULL,
    `desc2` VARCHAR(191) NULL,
    `portion` DOUBLE NULL,
    `calories` DOUBLE NULL,
    `carb` DOUBLE NULL,
    `fat` DOUBLE NULL,
    `protein` DOUBLE NULL,
    `fiber` DOUBLE NULL,
    `GI` DOUBLE NULL,
    `totalRowId` INTEGER NULL,

    UNIQUE INDEX `meal_totalRowId_key`(`totalRowId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recipe` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `desc1` VARCHAR(191) NULL,
    `desc2` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `portion` DOUBLE NOT NULL DEFAULT 0,
    `calories` DOUBLE NOT NULL,
    `carb` DOUBLE NOT NULL,
    `fat` DOUBLE NOT NULL,
    `protein` DOUBLE NOT NULL,
    `fiber` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `totalrowmeal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `datex` DATETIME(3) NULL,
    `desc1` VARCHAR(191) NULL,
    `desc2` VARCHAR(191) NULL,
    `calories` DOUBLE NOT NULL,
    `carb` DOUBLE NOT NULL,
    `fat` DOUBLE NOT NULL,
    `protein` DOUBLE NOT NULL,
    `fiber` DOUBLE NOT NULL,
    `portion` DOUBLE NOT NULL DEFAULT 0,
    `meal_tableId` INTEGER NOT NULL,

    UNIQUE INDEX `totalrowmeal_meal_tableId_key`(`meal_tableId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `totalrowRecipe` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `desc1` VARCHAR(191) NULL,
    `desc2` VARCHAR(191) NULL,
    `calories` DOUBLE NOT NULL,
    `carb` DOUBLE NOT NULL,
    `fat` DOUBLE NOT NULL,
    `protein` DOUBLE NOT NULL,
    `fiber` DOUBLE NOT NULL,
    `portion` DOUBLE NOT NULL DEFAULT 0,
    `recipe_tableId` INTEGER NOT NULL,

    UNIQUE INDEX `totalrowRecipe_recipe_tableId_key`(`recipe_tableId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `totalrowmeal` ADD CONSTRAINT `totalrowmeal_meal_tableId_fkey` FOREIGN KEY (`meal_tableId`) REFERENCES `meal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `totalrowRecipe` ADD CONSTRAINT `totalrowRecipe_recipe_tableId_fkey` FOREIGN KEY (`recipe_tableId`) REFERENCES `recipe`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
