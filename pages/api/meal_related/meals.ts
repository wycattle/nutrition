
import type { NextApiRequest, NextApiResponse } from 'next';
import { DateTime } from 'luxon';
import { IMealx, IDailyMealTotalx } from '../../../types_interfaces/interfaces';
import mealInstance from '../../../services/MealService';
import dailyTotals_Instance from '../../../services/dailyTotals_service';
import MealTotalsService from '../../../services/MealTotalsService';
import { calculateTotals } from '../../../utils/methods';
import fs from 'fs';
import path from 'path';
import { getAuthenticatedUser } from '../../../utils/getAuthenticatedUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  let userId: string;
  try {
    ({ userId } = await getAuthenticatedUser(req, res));
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (req.method === 'POST') {
      const mealData: IMealx = req.body;
      mealData.user_id = userId; // Attach user ID to meal data
      const now = DateTime.now().setZone('Asia/Bangkok');
      mealData.timestamp = now.toISO() ?? '';
      mealData.date = now.toISODate() ?? '';

      try {
        const newMeal = await mealInstance.createMeal(mealData);

        // Use shared calculateTotals and map to IDailyMealTotalx
        const totals = calculateTotals(mealData.details);
        const dailyMealTotals: IDailyMealTotalx = {
          id: Date.now(), // or another unique id logic
          date: mealData.date,
          timestamp: mealData.timestamp,
          caloriesTot: totals.caloriesTot,
          carbTot: totals.carbTot,
          fatTot: totals.fatTot,
          fiberTot: totals.fiberTot,
          portionTot: totals.portionTot,
          proteinTot: totals.proteinTot,
          user_id: userId, // Attach user ID to daily totals as well
        };
        await dailyTotals_Instance.createMeal(dailyMealTotals);

        // Save to meal_totals.json (append the new dailyMealTotals)
        const mealTotalsPath = path.join(process.cwd(), 'lib', 'data', 'meal_totals.json');
        let mealTotalsArr = [];
        try {
          if (fs.existsSync(mealTotalsPath)) {
            const fileData = fs.readFileSync(mealTotalsPath, 'utf-8');
            mealTotalsArr = fileData ? JSON.parse(fileData) : [];
          }
        } catch (err) {
          console.error('Error reading meal_totals.json:', err);
        }
        mealTotalsArr.push(dailyMealTotals);
        try {
          fs.writeFileSync(mealTotalsPath, JSON.stringify(mealTotalsArr, null, 2), 'utf-8');
        } catch (err) {
          console.error('Error writing meal_totals.json:', err);
        }

        res.status(200).json({ meal: newMeal, totals: dailyMealTotals });
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