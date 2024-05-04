// pages/api/updateRecipe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const recipesFilePath = path.join(process.cwd(), 'lib', 'recipes.json');
    const recipesData = JSON.parse(fs.readFileSync(recipesFilePath, 'utf8'));

    const updatedRecipe = req.body;
    const updatedrecipes = recipesData.map((recipe: any) => recipe.name === updatedRecipe.name ? updatedRecipe : recipe);

    fs.writeFileSync(recipesFilePath, JSON.stringify(updatedrecipes));

    res.status(200).json({ message: 'recipe updated successfully.' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}