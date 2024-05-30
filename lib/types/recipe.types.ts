// /lib/Recipe.types.ts

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

export type TotalRow = {
    id: number;
    // RecipeId: number;
    datex: Date;
    portionTot: number;
    caloriesTot: number;
    carbTot: number;
    fatTot: number;
    proteinTot: number;
    fiberTot: number;
    };

export type Per100 = {
    id: number;
    // RecipeId: number;
    datex: Date;
    portionTot: number;
    caloriesTot: number;
    carbTot: number;
    fatTot: number;
    proteinTot: number;
    fiberTot: number;
    };    
