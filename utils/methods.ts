// utils/methods.ts

import { formatInTimeZone } from 'date-fns-tz';
import { IMealx, IMealDetail, IRecipex } from '../types_interfaces/interfaces';


export function adjDate() {
  const currentDate = new Date();
  const adjustedDate = formatInTimeZone(currentDate, 'Asia/Bangkok', 'yyyy-MM-dd');

  return new Date(adjustedDate);
}





//used in frontend and.....
 export const applyPortionToRow = (row: IMealDetail, portionSize: number): IMealDetail => {
  if (!row || portionSize <= 0) return row;
  
  return {
    ...row,
    calories: Number(((row.calories || 0) * portionSize).toFixed(2)),
    carb:     Number(((row.carb     || 0) * portionSize).toFixed(2)),
    fat:      Number(((row.fat      || 0) * portionSize).toFixed(2)),
    protein:  Number(((row.protein  || 0) * portionSize).toFixed(2)),
    fiber:    Number(((row.fiber    || 0) * portionSize).toFixed(2)),
    portion:  Number(portionSize.toFixed(2)),
  };
};




    //used in frontend


export const calculateTotals = (details: IMealDetail[]) => {
  return details.reduce((acc, curr) => ({
    portionTot: acc.portionTot + (curr.portion ?? 0),
    caloriesTot: acc.caloriesTot + (curr.calories ?? 0),
    carbTot: acc.carbTot + (curr.carb ?? 0),
    fatTot: acc.fatTot + (curr.fat ?? 0),
    proteinTot: acc.proteinTot + (curr.protein ?? 0),
    fiberTot: acc.fiberTot + (curr.fiber ?? 0),
  }), {
    portionTot: 0,
    caloriesTot: 0,
    carbTot: 0,
    fatTot: 0,
    proteinTot: 0,
    fiberTot: 0,
  });
};

// Calculate per-100g values for totals (portion=1 means 100g)
export const calculatePer100g = (totals: {
  portionTot: number;
  caloriesTot: number;
  carbTot: number;
  fatTot: number;
  proteinTot: number;
  fiberTot: number;
}) => {
  const { portionTot } = totals;
  if (!portionTot || portionTot === 0) {
    return {
      caloriesPer100g: 0,
      carbPer100g: 0,
      fatPer100g: 0,
      proteinPer100g: 0,
      fiberPer100g: 0,
    };
  }
  return {
    caloriesPer100g: Number((totals.caloriesTot / portionTot).toFixed(2)),
    carbPer100g: Number((totals.carbTot / portionTot).toFixed(2)),
    fatPer100g: Number((totals.fatTot / portionTot).toFixed(2)),
    proteinPer100g: Number((totals.proteinTot / portionTot).toFixed(2)),
    fiberPer100g: Number((totals.fiberTot / portionTot).toFixed(2)),
  };
};




  export const createMealObject = (name: string, selectedRows: IMealDetail[]): IMealx => {
    const mealDetails: IMealDetail[] = selectedRows.map(row => ({
      desc1: row.desc1,
      desc2: row.desc2,
      portion: row.portion,
      calories: row.calories,
      carb: row.carb,
      fat: row.fat,
      protein: row.protein,
      fiber: row.fiber,
      GI: row.GI,
      note: row.note,
    }));

    return {
      name,
      date: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      details: mealDetails,
    };
  };




export const createRecipeObject = (name: string, selectedRows: IMealDetail[]): IRecipex => {
  return {
    name,
    details: selectedRows,
  };
};