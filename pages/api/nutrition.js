// pages/api/nutrition.js
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const csvFilePath = path.join(process.cwd(), 'lib', 'data', 'nutrition_table.csv');

// Read and parse the CSV file
//nutritionData is defined at module scope
//Top level = directly inside the module, not nested inside any function, class, or block.
const nutritionData = parse(fs.readFileSync(csvFilePath, 'utf8'), {
  columns: true, // Parse the CSV into objects with column headers as keys
  skip_empty_lines: true,
  relax_column_count: true, // Allows rows with blanks in fields
});

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      res.status(200).json(nutritionData);
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}