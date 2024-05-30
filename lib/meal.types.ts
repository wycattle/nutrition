// /lib/meal.types.ts

export type MealItemType = {
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

export type MealType = {
    name: string;
    datex: Date;
    items: MealItemType[];
    totals: MealTotalType[];
    };

export type MealTotalType = {
    datex: Date;
    portionTot: number;
    caloriesTot: number;
    carbTot: number;
    fatTot: number;
    proteinTot: number;
    fiberTot: number;
    };

export type TotalRowType = {
    id: number;
    // mealId: number;
    datex: Date;
    portionTot: number;
    caloriesTot: number;
    carbTot: number;
    fatTot: number;
    proteinTot: number;
    fiberTot: number;
    };


export type DailyTotals = {
    id: number;
    day: Date;
    total_calories: number;
    total_carbs: number;
    total_fat: number;
    total_protein: number;
    total_fiber: number;
    total_portion: number;
    };

export type TotalsSum = {
    total_calories: number;
    total_carbs: number;
    total_fat: number;
    total_protein: number;
    total_fiber: number;
    total_portion: number;
};


export type Per100 = {
    id: number;
    datex: Date;
    portionTot: number;
    caloriesTot: number;
    carbTot: number;
    fatTot: number;
    proteinTot: number;
    fiberTot: number;
    };    
