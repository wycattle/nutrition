// pages/api/meal_related/dailyTotals.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { DailyTotals } from '../../service/DailyTotals';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string; 
      const dailyTotalsService = new DailyTotals();
      const dailyTotals = await dailyTotalsService.getDailyTotals(startDate, endDate); //call the getDailyTotals method on an instance of the DailyTotals class, not on the class itself
      res.status(200).json(dailyTotals);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching daily totals', error: error.message });
    }
  } else {
    // Handle any non-GET requests
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}