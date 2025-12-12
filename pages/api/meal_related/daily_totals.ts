// pages/api/meal_related/dailyTotals.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { IDailyTotalx } from '../../../types/interfaces';
import dailyTotals_Instance from '../../../services/dailyTotals_service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      // Expect daily totals data in the request body
      const dailyTotals: IDailyTotalx = req.body;

      // Validate or transform dailyTotals here if necessary

      try {
        const newDailyTotals = await dailyTotals_Instance.createMeal(dailyTotals);
        res.status(200).json({ dailyTotals: newDailyTotals });
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