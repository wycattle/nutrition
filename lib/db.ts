// lib/db.ts
import { PrismaClient, Meal, Totalrow } from '@prisma/client';

type MealItemDetails = {
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
};

type MealItem = {
  name: string;
  date: Date;
  items: MealItemDetails[];
  totals: MealTotal;
};

type MealTotal = {
  portion_tot: number;
  calories_tot: number;
  carb_tot: number;
  fat_tot: number;
  protein_tot: number;
  fiber_tot: number;
};

class MealDB {
  private prisma: PrismaClient;

  constructor(){
    this.prisma = new PrismaClient();
  }

  async createMeal(meal: MealItem, total: MealTotal) {
  const createdMeal = await this.prisma.meal.create({
  data: {
    name: meal.name,
    date: meal.date,
    items: JSON.stringify(meal.items),
    totals: {
      create: {
        portionTot: meal.totals.portion_tot,
        caloriesTot: meal.totals.calories_tot,
        carbTot: meal.totals.carb_tot,
        fatTot: meal.totals.fat_tot,
        proteinTot: meal.totals.protein_tot,
        fiberTot: meal.totals.fiber_tot,
      },
    },
  },
  include: {
    totals: true,
  },
});

    return createdMeal;
  }

  async getMeals() {
    const meals = await this.prisma.meal.findMany({
      include: {
        totals: true,
      },
    });

    return meals.map(meal => ({
      ...meal,
      items: typeof meal.items === 'string' ? JSON.parse(meal.items) : meal.items,
    }));
  }
}

const mealDBInstance = new MealDB();
export default mealDBInstance;

//   async updateMeal(meal: Meal) {
//     const db = await this.openDb();
//     await db.run('UPDATE meals SET date = ?, items = ? WHERE name = ?', meal.date.toISOString(), JSON.stringify(meal.items), meal.name);  }



//   async deleteMeal(mealName: string) {
//     const db = await this.openDb();
//     await db.run('DELETE FROM meals WHERE name = ?', mealName);
//   }

// async getMealsInRange(startDate: Date, endDate: Date): Promise<{ date: string; meals: string; totals: { calories: number; carb: number; fat: number; protein: number; fiber: number } }[]> {
//   const db = await this.openDb();
//   const rows = await db.all('SELECT * FROM meals WHERE date BETWEEN ? AND ?', startDate.toISOString(), endDate.toISOString());

//   const mealsByDate = rows.reduce((acc, row) => {
//     const items = JSON.parse(row.items);
//     const totals = JSON.parse(row.totals);
//     acc[row.date] = (acc[row.date] || []).concat({
//       mealName: row.name,
//       calories: totals.calories_tot,
//       carb: totals.carb_tot,
//       fat: totals.fat_tot,
//       protein: totals.protein_tot,
//       fiber: totals.fiber_tot
//     });
//     return acc;
//   }, {});

//   const concatenatedMeals = Object.entries(mealsByDate).map(([date, meals]) => {
//     const mealItems = meals as { mealName: string; calories: number; carb: number; fat: number; protein: number; fiber: number }[];

//     return {
//       date,
//       meals: mealItems.map(meal => meal.mealName).join(', '),
//       totals: {
//         calories: mealItems.reduce((total: number, meal) => total + meal.calories, 0),
//         carb:     mealItems.reduce((total: number, meal) => total + meal.carb, 0),
//         fat:      mealItems.reduce((total: number, meal) => total + meal.fat, 0),
//         protein:  mealItems.reduce((total: number, meal) => total + meal.protein, 0),
//         fiber:    mealItems.reduce((total: number, meal) => total + meal.fiber, 0)
//       }
//     };
//   });

//   return concatenatedMeals;
// }}
