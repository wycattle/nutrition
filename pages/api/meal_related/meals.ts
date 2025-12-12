//pages/api/meal_related/Meal.ts
import type { NextApiRequest, NextApiResponse } from 'next';

import { IMealx }   from '../../../types/interfaces';
import mealInstance from '../../../services/MealService';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      // Destructure the request body directly into the expected structure of IMealx
      const mealData: IMealx = req.body;

      // Validate or transform mealData here if necessary

      try {
        const newMeal = await mealInstance.createMeal(mealData);
        res.status(200).json({ meal: newMeal });
      } catch (error) {
        console.error('Error in createMeal:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error in /api/meal_related/Meal:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}