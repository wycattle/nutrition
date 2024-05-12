// lib/db.ts
import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';

type Recipe = {
  name: string;
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

class MealDB {
  private db: Database | null = null;

  async openDb() {
    if (this.db === null) {
      this.db = await open({
        filename: './lib/mydb.sqlite',
        driver: sqlite3.Database
      });
      await this.db.run('CREATE TABLE IF NOT EXISTS recipes (name TEXT, date DATE, items BLOB)');
      await this.db.run('CREATE TABLE IF NOT EXISTS meals (name TEXT, date DATE, items TEXT)');
      await this.db.run('CREATE TABLE IF NOT EXISTS mealItems (date DATE, mealName TEXT, desc_1 TEXT, desc_2 TEXT, portion REAL, calories REAL, carb REAL, fat REAL, protein REAL, fiber REAL, GI REAL, note TEXT)');
    }
    return this.db;
  }




  async Meals(): Promise<Meal[]> {
    const db = await this.openDb();
    const rows = await db.all('SELECT * FROM meals');
    return rows.map(row => ({ name: row.name, date: new Date(row.date), items: JSON.parse(row.items) }));
  }




  async saveMeal(meal: Meal) {
    const db = await this.openDb();
    await db.run('INSERT INTO meals (name, date, items) VALUES (?,?, ?)', meal.name, meal.date.toISOString(),JSON.stringify(meal.items) );

    for (const item of meal.items) {
      await db.run('INSERT INTO mealItems (date, mealName, desc_1, desc_2, portion, calories, carb, fat, protein, fiber, GI, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', meal.date.toISOString(), meal.name, item.desc_1, item.desc_2, item.portion, item.calories, item.carb, item.fat, item.protein, item.fiber, item.GI, item.note);
    }

    const savedMeal = await db.get('SELECT * FROM meals WHERE name = ?', meal.name);
    console.log('Saved meal:', savedMeal);
  }




  async updateMeal(meal: Meal) {
    const db = await this.openDb();
    await db.run('UPDATE meals SET date = ?, items = ? WHERE name = ?', meal.date.toISOString(), JSON.stringify(meal.items), meal.name);  }




  async deleteMeal(mealName: string) {
    const db = await this.openDb();
    await db.run('DELETE FROM meals WHERE name = ?', mealName);
  }




  async getMealsInRange(startDate: Date, endDate: Date): Promise<{ date: string, meals: string }[]> {
    const db = await this.openDb();
    const rows = await db.all('SELECT * FROM mealItems WHERE date BETWEEN ? AND ?', startDate.toISOString(), endDate.toISOString());
    
    const mealsByDate = rows.reduce((acc, row) => {
      acc[row.date] = (acc[row.date] || []).concat({
        mealName: row.mealName,
        calories: row.calories,
        carb: row.carb,
        fat: row.fat,
        protein: row.protein,
        fiber: row.fiber
      });
      return acc;
    }, {});

    const concatenatedMeals = Object.entries(mealsByDate).map(([date, meals]) => {
      const mealItems = meals as { mealName: string; calories: number; carb: number; fat: number; protein: number; fiber: number }[];
      return {
        date,
        meals:    mealItems.map(meal => meal.mealName).join(', '),
        calories: mealItems.reduce((total: number, meal) => total + meal.calories, 0),
        carb:     mealItems.reduce((total: number, meal) => total + meal.carb, 0),
        fat:      mealItems.reduce((total: number, meal) => total + meal.fat, 0),
        protein:  mealItems.reduce((total: number, meal) => total + meal.protein, 0),
        fiber:    mealItems.reduce((total: number, meal) => total + meal.fiber, 0)
      };
    });
      
    return concatenatedMeals;
  }
}




const mealDBInstance = new MealDB();
export default mealDBInstance;

