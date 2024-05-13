// pages/api/getMealsInRange.ts
import  { NextApiRequest, NextApiResponse } from 'next';
import mealDBInstance  from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { start, end } = req.query;
      const startDate = new Date(start as string);
      const endDate = new Date(end as string);
      const mealsData = await mealDBInstance.getMealsInRange(startDate, endDate);

      console.log('fffffmealsData',mealsData);

      res.status(200).json(mealsData);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching meals' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}