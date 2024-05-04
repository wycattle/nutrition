// lib/db.ts
import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';


type Recipe = {
  name: string;
  date: string;
  items: any[];
};

type Meal = {
  name: string;
  date: Date;
  items: any[];
};

let db: Database | null = null;

export async function openDb() {
  if (db === null) {
    db = await open({
      filename: './lib/mydb.sqlite',
      driver: sqlite3.Database
    });
    await db.run('CREATE TABLE IF NOT EXISTS recipes (name TEXT, date TEXT, items TEXT)');
    await db.run('CREATE TABLE IF NOT EXISTS meals (name TEXT, date TEXT, items TEXT)');
  }
  return db;
}

export async function getRecipes(): Promise<Recipe[]> {
  const db = await openDb();
  const rows = await db.all('SELECT * FROM recipes');
  return rows.map(row => ({ name: row.name, date: row.date, items: JSON.parse(row.items) }));
}

export async function getMeals(): Promise<Meal[]> {
  const db = await openDb();
  const rows = await db.all('SELECT * FROM meals');
  return rows.map(row => ({ name: row.name, date: new Date(row.date), items: JSON.parse(row.items) }));
}

export async function saveRecipe(recipe: Recipe) {
  const db = await openDb();
  await db.run('INSERT INTO recipes (name, date, items) VALUES (?, ?, ?)', recipe.name, recipe.date, JSON.stringify(recipe.items));
}

export async function saveMeal(meal: Meal) {
  const db = await openDb();
  await db.run('INSERT INTO meals (name, date, items) VALUES (?, ?, ?)', meal.name, meal.date.toISOString(), JSON.stringify(meal.items));
}

export async function updateRecipe(recipe: Recipe) {
  const db = await openDb();
  await db.run('UPDATE recipes SET date = ?, items = ? WHERE name = ?', recipe.date, JSON.stringify(recipe.items), recipe.name);
}

export async function updateMeal(meal: Meal) {
  const db = await openDb();
  await db.run('UPDATE meals SET date = ?, items = ? WHERE name = ?', meal.date.toISOString(), JSON.stringify(meal.items), meal.name);
}

export async function deleteMeal(mealName: string) {
  const db = await openDb();
  await db.run('DELETE FROM meals WHERE name = ?', mealName);
}

export async function deleteRecipe(recipeName: string) {
  const db = await openDb();
  await db.run('DELETE FROM recipes WHERE name = ?', recipeName);
}