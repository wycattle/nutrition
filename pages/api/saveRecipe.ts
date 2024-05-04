// pages/api/saveRecipe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const recipesFilePath = path.join(process.cwd(), 'lib', 'recipes.json');
    const recipesData = JSON.parse(fs.readFileSync(recipesFilePath, 'utf8'));

    const newMeal = req.body;
    recipesData.push(newMeal);

    fs.writeFileSync(recipesFilePath, JSON.stringify(recipesData));
    
    // Path to your local JSON database
    const localDbPath = path.join(process.cwd(), 'lib', 'recipes.json');
    fs.writeFileSync(localDbPath, JSON.stringify(recipesData));

    res.status(200).json({ message: 'Recipe saved successfully.' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}