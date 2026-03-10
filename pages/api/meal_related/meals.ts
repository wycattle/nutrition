

import type { NextApiRequest, NextApiResponse } from 'next';
import { IMealx, IDailyMealTotalx } from '../../../types_interfaces/interfaces';
import mealInstance from '../../../services/MealService';
import MealTotalsService from '../../../services/MealTotalsService';
import { getApiUrl } from '../../../utils/getApiUrl';
import { calculateTotals } from '../../../utils/methods';
import { getAuthenticatedUser } from '../../../utils/getAuthenticatedUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Authenticate ONCE at the top
  let userId: string;
  const startAll = Date.now();
  try {
    console.time('auth-user');
    ({ userId } = await getAuthenticatedUser(req, res));
    console.timeEnd('auth-user');
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Pass userId to all DB/service calls below
  try {
    if (req.method === 'POST') {
      const mealData: IMealx = req.body;
      mealData.user_id = userId; // Attach user ID to meal data

      try {
        const t0 = Date.now();
        console.time('createMeal');
        const newMeal = await mealInstance.createMeal(mealData);
        console.timeEnd('createMeal');
        const t1 = Date.now();

        // Use shared calculateTotals and map to IDailyMealTotalx
        const totals = calculateTotals(mealData.details);
        const dailyMealTotals: IDailyMealTotalx = {
          id:         Date.now(),
          date:       mealData.date,
          timestamp:  mealData.timestamp,
          caloriesTot:totals.caloriesTot,
          carbTot:    totals.carbTot,
          fatTot:     totals.fatTot,
          fiberTot:   totals.fiberTot,
          portionTot: totals.portionTot,
          proteinTot: totals.proteinTot,
          user_id: userId,
        };

        console.time('saveTotals');
        const savedTotals = await MealTotalsService.save(dailyMealTotals);
        console.timeEnd('saveTotals');
        const t2 = Date.now();

        res.status(200).json({ meal: newMeal, totals: savedTotals });

//measure time taken to process the query

        const t3 = Date.now();
        console.log('[API /api/meal_related/meals] Timing:', {
          total: t3 - startAll + 'ms',
          auth: t0 - startAll + 'ms',
          createMeal: t1 - t0 + 'ms',
          saveTotals: t2 - t1 + 'ms',
          response: t3 - t2 + 'ms',
        });
      } catch (error) {
        console.error('Error in createMeal:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    } else if (req.method === 'GET') {
      // Example: Use getApiUrl for any outgoing API call (if needed in the future)
      // const apiUrl = getApiUrl();
      // const response = await fetch(`${apiUrl}/api/other_endpoint`);
      res.status(405).json({ message: 'Method Not Allowed' });
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error in /api/meal_related/Meal:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}