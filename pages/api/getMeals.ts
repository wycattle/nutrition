// pages/api/getMeals.ts
import  { NextApiRequest, NextApiResponse } from 'next';
import { getMealsGroupedByDate } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const mealsData = await getMealsGroupedByDate();
      res.status(200).json(mealsData);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching meals' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}