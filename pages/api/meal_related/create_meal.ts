//pages/api/meal_related/create_meal.ts
import type { NextApiRequest, NextApiResponse } from 'next';

import { MealType } from '../../../lib/meal.types';
import meal_instance from '../../service/meal.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const mealDB = await meal_instance;


  try {
    if (req.method === 'POST') {
      const { name, datex, items } = req.body;

      const meal: MealType = {    //meal is an object, which you're creating from the data sent in the request body (req.body). Meal is a 'type'
        name,
        datex,
        items,
        totals: [],
      };

      try {
        const newMeal = await mealDB.createMeal(meal);
        res.status(200).json({ meal: newMeal }); 
      } catch (error) {
        console.error('Error in createMeal:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error in /api/meal_related/create_meal:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}