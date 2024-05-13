// pages/api/meal_related/saveMeal.ts

import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const newMeal = req.body;

    console.log('xxx from api req body:', req.body);
    console.log('xxx from api Received meal:', newMeal);
    try {

      console.log('xxnewMeal:', newMeal);
      console.log('xx newmeal.date', newMeal.date)
      console.log('xx, newMeal.totals', newMeal.totals)

      if (isNaN(Date.parse(newMeal.date))) {
        console.error('Invalid date:', newMeal.date);
        throw new Error('Invalid date');
      }

      newMeal.date = new Date(newMeal.date);

      console.log('xxx from api  Attempting to save meal:', newMeal);

      const createdMeal = await db.createMeal(newMeal, newMeal.totals);

      console.log('xx api  Meal saved successfully');

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