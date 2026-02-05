import type { NextApiRequest, NextApiResponse } from 'next';
import RecipeService from '../../../services/recipe_service';
import { IRecipex } from '../../../types_interfaces/interfaces';
import RecipeTotalsService from '../../../services/RecipeTotalsService';
import { calculateTotals } from '../../../utils/methods';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { name } = req.query;
      if (typeof name === 'string') {
        const recipe = RecipeService.getByName(name);
        if (recipe) {
          res.status(200).json(recipe);
        } else {
          res.status(404).json({ message: 'Recipe not found' });
        }
      } else {
        const recipes = RecipeService.getAll();
        res.status(200).json(recipes);
      }
    } else if (req.method === 'POST') {
      const recipeData: IRecipex = req.body;
      if (!recipeData.name || !Array.isArray(recipeData.details)) {
        res.status(400).json({ message: 'Invalid recipe data' });
        return;
      }
      const saved = RecipeService.save(recipeData);
      // Calculate totals row for recipe
      const totals = calculateTotals(recipeData.details);
      const recipeTotals = {
        name: recipeData.name,
        caloriesTot: totals.caloriesTot,
        carbTot: totals.carbTot,
        fatTot: totals.fatTot,
        fiberTot: totals.fiberTot,
        portionTot: totals.portionTot,
        proteinTot: totals.proteinTot,
      };
      RecipeTotalsService.save(recipeTotals);
      res.status(200).json({ recipe: saved, message: 'Recipe saved', totals: recipeTotals });
    } else if (req.method === 'DELETE') {
      const { name } = req.query;
      if (typeof name !== 'string') {
        res.status(400).json({ message: 'Recipe name required' });
        return;
      }
      const deleted = RecipeService.delete(name);
      if (deleted) {
        res.status(200).json({ message: 'Recipe deleted' });
      } else {
        res.status(404).json({ message: 'Recipe not found' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in /api/recipe_related/recipes:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}