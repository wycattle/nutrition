// pages/service/methods.ts

import { formatInTimeZone } from 'date-fns-tz';

export function adjDate() {
  const currentDate = new Date();
  const adjustedDate = formatInTimeZone(currentDate, 'Asia/Bangkok', 'yyyy-MM-dd');

  return new Date(adjustedDate);
}


// import { RecipeDataType } from '../lib/types/recipe.types';
// export function calculateTotalsRecipe(recipe: RecipeDataType):
// { 
//     portion:   number,  
//     calories:  number, 
//     carb:      number, 
//     fat:       number, 
//     protein:   number, 
//     fiber:     number,
//   } 
  
//   {
//     return {
//       portion : recipe.portion || 0,
//       calories : recipe.calories || 0,
//       carb    : recipe.carb || 0,
//       fat     : recipe.fat || 0,
//       protein : recipe.protein || 0,
//       fiber   : recipe.fiber || 0,
//     }}




    import { IMealDetail } from '../pages/interfaces';

    // Adjust the function to accept an array of IMealData objects and include additional fields in the return type
    export function calculateMealTotals(meals: IMealDetail[]): IMealDetail {
      const totals = meals.reduce((totals, meal) => ({
        ...totals,
        portion:  (totals.portion || 0) +   (meal.portion || 0),
        calories: (totals.calories || 0) +  (meal.calories || 0),
        carb:     (totals.carb || 0) +      (meal.carb || 0),
        fat:      (totals.fat || 0) +       (meal.fat || 0),
        protein:  (totals.protein || 0) +   (meal.protein || 0),
        fiber:    (totals.fiber || 0) +     (meal.fiber || 0),
      }), {
        // namex: 'Totals', // Placeholder name for the totals row
        // datex: new Date(),
        desc1: '', // Placeholder desc1
        desc2: '', // Placeholder desc2
        portion: 0,
        calories: 0,
        carb: 0,
        fat: 0,
        protein: 0,
        fiber: 0,
        GI: 0,
        note: '',
        // Include default values for any other required fields in IMealData
      });
    
      return totals;
    }






    export function createEmptyStructure<T extends object>(): Partial<Record<keyof T, unknown>> {
      const result: Partial<Record<keyof T, unknown>> = {};
      for (const key in ({} as T)) {
        result[key] = undefined;
      }
      return result;
    }

//used in frontend
    export const applyPortionToRow = (row, portionSize) => ({
      ...row,
      calories: (row.calories || 0) * portionSize,
      carb: (row.carb || 0) * portionSize,
      fat: (row.fat || 0) * portionSize,
      protein: (row.protein || 0) * portionSize,
      fiber: (row.fiber || 0) * portionSize,
      portion: portionSize,
    });