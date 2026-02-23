import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// POST handler to save per-100g recipe data to lib/data/recipe_per100g.json
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const per100gData = req.body;
    if (!per100gData || !per100gData.name) {
      return res.status(400).json({ message: 'Invalid per100g data' });
    }

    const filePath = path.join(process.cwd(), 'lib', 'data', 'recipe_per100g.json');
    let arr = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      arr = fileData ? JSON.parse(fileData) : [];
    }
    // Remove any existing entry for this recipe name
    arr = arr.filter((item: any) => item.name !== per100gData.name);
    arr.push(per100gData);
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), 'utf-8');
    return res.status(200).json({ message: 'Per-100g data saved', per100g: per100gData });
  } catch (error) {
    console.error('Error saving per-100g recipe data:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
