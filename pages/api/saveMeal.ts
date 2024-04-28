// pages/api/saveMeal.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const mealsFilePath = path.join(process.cwd(), 'lib', 'meals.json');
    const mealsData = JSON.parse(fs.readFileSync(mealsFilePath, 'utf8'));

    const newMeal = req.body;
    mealsData.push(newMeal);

    fs.writeFileSync(mealsFilePath, JSON.stringify(mealsData));
    
    // Path to your local JSON database
    const localDbPath = path.join(process.cwd(), 'lib', 'meals.json');
    fs.writeFileSync(localDbPath, JSON.stringify(mealsData));

    res.status(200).json({ message: 'Meal saved successfully.' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}