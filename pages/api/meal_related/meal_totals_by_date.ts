// pages/api/meal_related/meal_totals_by_date.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import MealTotalsService from '../../../services/MealTotalsService';


//this is the endpoint for the totals by date page


export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { start, end } = req.query;
  if (!start || !end || typeof start !== 'string' || typeof end !== 'string') {
    res.status(400).json({ message: 'Missing or invalid start/end date' });
    return;
  }

  try {
    const allTotals = MealTotalsService.getAll();
    // Filter by date (inclusive)
    const filtered = allTotals.filter(row => {
      // row.date is expected to be in 'YYYY-MM-DD' format
      return row.date >= start && row.date <= end;
    });
    res.status(200).json({ totals: filtered });
  } catch (error) {
    console.error('Error in meal_totals_by_date:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
