// pages/api/getRecipes.ts
import  { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const recipesFilePath = path.join(process.cwd(), 'lib', 'recipes.json');
    const recipesData = JSON.parse(fs.readFileSync(recipesFilePath, 'utf8'));
    res.status(200).json(recipesData);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}