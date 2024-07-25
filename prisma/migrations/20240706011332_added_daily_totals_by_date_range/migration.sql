-- CreateTable
CREATE TABLE `daily_totals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `calories` DOUBLE NOT NULL,
    `carbs` DOUBLE NOT NULL,
    `fat` DOUBLE NOT NULL,
    `fiber` DOUBLE NOT NULL,
    `portion_weight` DOUBLE NOT NULL DEFAULT 0,
    `protein` DOUBLE NOT NULL,
    `dailyTotalsId` INTEGER NOT NULL,

    UNIQUE INDEX `daily_totals_dailyTotalsId_key`(`dailyTotalsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
