// pages/api/saveMeal.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { saveMeal } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const newMeal = req.body;

    try {
      await saveMeal(newMeal);
      res.status(200).json({ message: 'Meal saved successfully.' });
    } catch (error) {
      res.status(500).json({ message: 'Error saving meal.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}