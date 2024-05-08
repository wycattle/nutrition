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

type MealGroupedByDate = {
  name: string;
  totalsByDate: Record<string, any>;

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
    await db.run('CREATE TABLE IF NOT EXISTS mealsGroupedByDate (name TEXT, totalsByDate TEXT)');
  }
  return db;
}

// Existing functions...

export async function getMealsGroupedByDate(): Promise<MealGroupedByDate[]> {
  const db = await openDb();
  const rows = await db.all('SELECT * FROM mealsGroupedByDate');
  return rows.map(row => ({ name: row.name, totalsByDate: JSON.parse(row.totalsByDate) }));
}

export async function saveMealGroupedByDate(meal: MealGroupedByDate) {
  const db = await openDb();
  await db.run('INSERT INTO mealsGroupedByDate (name, totalsByDate) VALUES (?, ?, ?)', meal.name, JSON.stringify(meal.totalsByDate));
}

export async function updateMealGroupedByDate(meal: MealGroupedByDate) {
  const db = await openDb();
  await db.run('UPDATE mealsGroupedByDate SET totalsByDate = ? = ? WHERE name = ?', JSON.stringify(meal.totalsByDate), meal.name);
}

export async function deleteMealGroupedByDate(mealName: string) {
  const db = await openDb();
  await db.run('DELETE FROM mealsGroupedByDate WHERE name = ?', mealName);
}