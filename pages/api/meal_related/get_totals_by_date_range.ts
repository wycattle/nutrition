// pages/api/meal_related/get_totals_by_date_range.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import mealDB_instance from '../../../lib/mealDB';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const mealDB = await mealDB_instance;
  const { startDate, endDate } = req.query;

  try {
    const meals = await mealDB.getTotalsByDateRange(new Date(startDate), new Date(endDate));
    res.status(200).json(meals);
  } catch (error) {
    console.error('Error in getTotalsByDateRange:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}