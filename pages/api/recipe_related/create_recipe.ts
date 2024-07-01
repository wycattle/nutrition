//pages/api/recipe_related/create_recipe.ts

import type { NextApiRequest, NextApiResponse } from 'next';

import { IRecipex } from '../../interfaces.ts';
import recipeInstance from '../../service/recipe_service.ts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      // Destructure the request body directly into the expected structure of IRecipex
      const recipeData: IRecipex = req.body;

      // Validate or transform recipeData here if necessary

      try {
        const newRecipe = await recipeInstance.createRecipe(recipeData);
        res.status(200).json({ recipe: newRecipe });
      } catch (error) {
        console.error('Error in createRecipe:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error in /api/recipe_related/create_recipe:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}