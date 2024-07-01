import { PrismaClient } from '@prisma/client';
import { IMealx, IMealDetail } from '../interfaces';

const prisma = new PrismaClient();

export class MealService {
  async createMeal(mealData: IMealx) {
    const createdMeal = await prisma.mealx.create({
      data: {
        namex: mealData.namex,
        datex: mealData.datex,
        details: mealData.details as any, // Use 'any' or a more specific type if known
      },
    });;

    // Calculate totals from the details
    const totals = mealData.details.reduce((acc, curr) => ({
      portionTot: acc.portionTot + (curr.portion ?? 0),
      caloriesTot: acc.caloriesTot + (curr.calories ?? 0),
      carbTot: acc.carbTot + (curr.carb ?? 0),
      fatTot: acc.fatTot + (curr.fat ?? 0),
      proteinTot: acc.proteinTot + (curr.protein ?? 0),
      fiberTot: acc.fiberTot + (curr.fiber ?? 0),
    }), {
      portionTot: 0,
      caloriesTot: 0,
      carbTot: 0,
      fatTot: 0,
      proteinTot: 0,
      fiberTot: 0,
    });

    // Create a "totals" row in the totalRow_table, linked to the created meal
    const totalRow = await prisma.totalRow_table.create({
      data: {
        mealId: createdMeal.id, // Linking the total row to the created meal entry
        portionTot: totals.portionTot,
        caloriesTot: totals.caloriesTot,
        carbTot: totals.carbTot,
        fatTot: totals.fatTot,
        proteinTot: totals.proteinTot,
        fiberTot: totals.fiberTot,
      },
    });

    return { createdMeal, totalRow };
  }
}

const mealInstance = new MealService();
export default mealInstance;