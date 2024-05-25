// /lib/types.ts

export type MealItem = {
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

export type Meal = {
    name: string;
    datex: Date;
    items: MealItem[];
    totals: MealTotal[];
    };

export type MealTotal = {
    datex: Date;
    portionTot: number;
    caloriesTot: number;
    carbTot: number;
    fatTot: number;
    proteinTot: number;
    fiberTot: number;
    };

export type TotalRow = {
    id: number;
    mealId: number;
    datex: Date;
    portionTot: number;
    caloriesTot: number;
    carbTot: number;
    fatTot: number;
    proteinTot: number;
    fiberTot: number;
    };

export type RecipeItem = {
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

export type Recipe = {
    name: string;
    datex: Date;
    items: RecipeItem[];
    totals: RecipeTotal[];
    };

export type RecipeTotal = {
    datex: Date;
    portionTot: number;
    caloriesTot: number;
    carbTot: number;
    fatTot: number;
    proteinTot: number;
    fiberTot: number;
    };


export type TotalsByDate = {
[datex: string]: MealTotal;
};
  