// pages/api/saveMeal.ts
import { NextApiRequest, NextApiResponse } from 'next';
import MealDB from '../../../lib/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const newMeal = req.body;
    console.log('Received meal:', newMeal);

    try {
      if (isNaN(Date.parse(newMeal.date))) {
        console.error('Invalid date:', newMeal.date);
        throw new Error('Invalid date');
      }

      newMeal.date = new Date(newMeal.date);
      console.log('Attempting to save meal:', newMeal);
      await MealDB.saveMeal(newMeal);
      console.log('Meal saved successfully');
      res.status(200).json({ message: 'Meal saved successfully.' });
    } catch (error) {
      console.error('Error in handler while saving meal:', error);
      res.status(500).json({ message: `Error saving meal` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}