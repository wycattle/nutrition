
console.log('insertRecipes script starting...');

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { recipes } from '../db/recipes.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import 'dotenv/config';

// Set up the database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

// ES module __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function insertRecipes() {
  // Read recipes.json
  const filePath = path.join(__dirname, '../data/recipes.json');
  console.log('Using DATABASE_URL:', process.env.DATABASE_URL);
  console.log('Reading recipes from:', filePath);
  const data = fs.readFileSync(filePath, 'utf-8');
  const recipesArray = JSON.parse(data);
  console.log('Recipes found:', recipesArray.length);

  for (const recipe of recipesArray) {
    try {
      await db.insert(recipes).values({
        name: recipe.name,
        details: recipe.details,
      });
      console.log(`Inserted recipe: ${recipe.name}`);
    } catch (err) {
      console.error(`Error inserting recipe ${recipe.name}:`, err);
    }
  }

  console.log('All recipes inserted.');
  pool.end();
}

insertRecipes().catch(err => {
  console.error('Error inserting recipes:', err);
  pool.end();
});
