// pages/api/nutrition.js
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const csvFilePath = path.join(process.cwd(), 'lib', 'data', 'nutrition_table.csv');

// Read and parse the CSV file...Synchronously reads the entire contents of a file.
const nutritionData = parse(fs.readFileSync(csvFilePath, 'utf8'),{
  columns: true,  // Parse the CSV into objects with column headers as keys
  skip_empty_lines: true, 
});

export default nutritionData;