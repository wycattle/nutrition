//    /pages/interfaces.ts

import { Timestamp } from "next/dist/server/lib/cache-handlers/types";

// export interface HomepageType{      }

export interface GlobalState {
    globalStateVariable: any;
    setGlobalStateVariable: (newValue: any) => void;
}

export interface IOption {
    label: string;
    value: string;   }


export interface IMealx {
  date: string;
  timestamp: string;
  details: IMealDetail[];     //example of 'composition'
  user_id?: string;
}


export interface IMealDetail {
    desc1   : string;
    desc2   : string;
    portion : number | undefined; 
    calories: number | undefined;
    carb    : number | undefined;
    fat     : number | undefined;
    protein : number | undefined;
    fiber   : number | undefined;
    GI      : number | undefined;
    note    : string;    }

export interface NutrientCalories {
  carbCalories: number;
  fatCalories: number;
  proteinCalories: number;
  grandTotal: number;
}


export interface IRecipex {
  name: string;
  details: IMealDetail[];
  category?: string;
}    

 

export interface IDailyMealTotalx {
  id: number;
  date: string;
  timestamp: string;
  caloriesTot: number;
  carbTot: number;
  fatTot: number;
  fiberTot: number;
  portionTot: number;
  proteinTot: number;
  user_id?: string;
}


// For recipe totals row
export interface IRecipeTotals {
  name: string;
  caloriesTot: number;
  carbTot: number;
  fatTot: number;
  fiberTot: number;
  portionTot: number;
  proteinTot: number;
}
