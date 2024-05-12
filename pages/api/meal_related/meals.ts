// pages/api/meal_related/meals.ts
import { NextApiRequest, NextApiResponse } from 'next';
import MealDB from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const start = new Date(req.query.start as string);
    const end = new Date(req.query.end as string);
    const meals = await MealDB.Meals();

    const filteredMeals = meals.filter(meal => {
      const mealDate = new Date(meal.date);
      return mealDate >= start && mealDate <= end;
    });

    res.status(200).json(filteredMeals);

  } else if (req.method === 'POST') {
    // Extract meal data from request body
    const meal = req.body;
    await MealDB.saveMeal(meal);
    res.status(200).json({ message: 'Meal saved' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}