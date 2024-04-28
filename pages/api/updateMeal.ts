// pages/api/updateMeal.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const mealsFilePath = path.join(process.cwd(), 'lib', 'meals.json');
    const mealsData = JSON.parse(fs.readFileSync(mealsFilePath, 'utf8'));

    const updatedMeal = req.body;
    const updatedMeals = mealsData.map((meal: any) => meal.name === updatedMeal.name ? updatedMeal : meal);

    fs.writeFileSync(mealsFilePath, JSON.stringify(updatedMeals));

    res.status(200).json({ message: 'Meal updated successfully.' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}