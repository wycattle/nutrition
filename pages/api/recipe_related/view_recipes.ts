// pages/api/recipe_related/view_recipes.ts

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import type { NextApiRequest, NextApiResponse } from 'next';

const csvFilePath = path.join(process.cwd(), 'lib', 'data', 'nutrition_table.csv');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const csvData = fs.readFileSync(csvFilePath, 'utf8');
      const recipes = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
      });
      res.status(200).json(recipes);
    } catch (error) {
      console.error('Error reading recipes:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}