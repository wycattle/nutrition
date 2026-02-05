// pages/api/meal_related/dailyMealTotals.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { IDailyMealTotalx } from '../../../types_interfaces/interfaces';
import dailyTotals_Instance from '../../../services/dailyTotals_service';



//daily_totals.ts handles POST requests to save a single day's totals.
//this is not the api endpoint for the meal_totals_by_date !!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      // Expect daily totals data in the request body
      const dailyMealTotals: IDailyMealTotalx = req.body;

      // Validate or transform dailyMealTotals here if necessary

      try {
        const newDailyTotals = await dailyTotals_Instance.createMeal(dailyMealTotals);
        res.status(200).json({ dailyMealTotals: newDailyTotals });
      } catch (error) {
        console.error('Error in createDailyTotals:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error in /api/meal_related/meal-totals:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}