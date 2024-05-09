// lib/db.ts
import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';

type Recipe = {
  name: string;
  date: string;
  items: any[];
};

type MealItem = {
  mealName: string;
  desc_1: string;
  desc_2: string;
  portion: number;
  calories: number;
  carb: number;
  fat: number;
  protein: number;
  fiber: number;
  GI: number;
  note: string;
  date: Date;
};


type Meal = {
  name: string;
  date: Date;
  items: MealItem[];
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
    await db.run('CREATE TABLE IF NOT EXISTS mealItems (mealName TEXT, desc_1 TEXT, desc_2 TEXT, portion REAL, calories REAL, carb REAL, fat REAL, protein REAL, fiber REAL, GI REAL, note TEXT)');
  }
  return db;
}

export async function getMeals(): Promise<Meal[]> {
  const db = await openDb();
  const rows = await db.all('SELECT * FROM meals');
  return rows.map(row => ({ name: row.name, date: new Date(row.date), items: JSON.parse(row.items) }));
}

export async function saveMeal(meal: Meal) {
  const db = await openDb();
  await db.run('INSERT INTO meals (name, date) VALUES (?, ?)', meal.name, meal.date.toISOString());

  for (const item of meal.items) {
    await db.run('INSERT INTO mealItems (mealName, desc_1, desc_2, portion, calories, carb, fat, protein, fiber, GI, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', meal.name, item.desc_1, item.desc_2, item.portion, item.calories, item.carb, item.fat, item.protein, item.fiber, item.GI, item.note);
  }

  const savedMeal = await db.get('SELECT * FROM meals WHERE name = ?', meal.name);
  console.log('Saved meal:', savedMeal);
}

export async function updateMeal(meal: Meal) {
  const db = await openDb();
  await db.run('UPDATE meals SET date = ?, items = ? WHERE name = ?', meal.date.toISOString(), JSON.stringify(meal.items), meal.name);
}

export async function deleteMeal(mealName: string) {
  const db = await openDb();
  await db.run('DELETE FROM meals WHERE name = ?', mealName);
}