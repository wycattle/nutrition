import { PrismaClient } from '@prisma/client';
import { IRecipex, IRecipeDetail } from '../interfaces';

const prisma = new PrismaClient();

export class RecipeService {
  async createRecipe(recipeData: IRecipex) {
    const createdRecipe = await prisma.recipe_table.create({
      data: {
        namex: recipeData.namex,
        details: recipeData.details as any, // Use 'any' or a more specific type if known
      },
    });;

    // Calculate totals from the details
    const totals = recipeData.details.reduce((acc, curr) => ({
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
    const totalRow = await prisma.recipeTotalRow_table.create({
      data: {
        recipexId: createdRecipe.id, // Linking the total row to the created meal entry
        portionTot: totals.portionTot,
        caloriesTot: totals.caloriesTot,
        carbTot: totals.carbTot,
        fatTot: totals.fatTot,
        proteinTot: totals.proteinTot,
        fiberTot: totals.fiberTot,
      },
    });

    return { createdRecipe, totalRow };
  }
}

const recipeInstance = new RecipeService();
export default recipeInstance;