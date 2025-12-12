// pages/api/recipe_related/recipes.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { IRecipex } from '../../../types/interfaces';
import recipeInstance from '../../../services/recipe_service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      // Expect recipe data in the request body
      const recipeData: IRecipex = req.body;

      // Validate or transform recipeData here if necessary

      try {
        const newRecipe = await recipeInstance.createMeal(recipeData);
        res.status(200).json({ recipe: newRecipe });
      } catch (error) {
        console.error('Error in createMeal:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error in /api/recipe_related/recipes:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}