// pages/service/methods.ts

import { formatInTimeZone } from 'date-fns-tz';

export function adjDate() {
  const currentDate = new Date();
  const adjustedDate = formatInTimeZone(currentDate, 'Asia/Bangkok', 'yyyy-MM-dd');

  return new Date(adjustedDate);
}





//used in frontend and.....
 export const applyPortionToRow = (row, portionSize) => {
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
    import { IMealDetail } from '../pages/interfaces';

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
    date: new Date(),
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