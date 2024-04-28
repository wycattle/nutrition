// pages/api/getMeals.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const mealsFilePath = path.join(process.cwd(), 'lib', 'meals.json');
    const mealsData = JSON.parse(fs.readFileSync(mealsFilePath, 'utf8'));
    res.status(200).json(mealsData);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}