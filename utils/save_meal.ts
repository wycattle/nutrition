// utils/save_meal.ts

import { saveMealGroupedByDate } from '../lib/db';
const saveAsMealGroupedByDate = async (nomen: string, totalsByDate: Record<string, any>)  => {
  console.log('saveAsMealGroupedByDate called with:', nomen, totalsByDate);

  const mealData = {
    name: nomen,
    totalsByDate: totalsByDate
  };

  console.log('mealData:', mealData);


  try {
    await saveMealGroupedByDate(mealData);

    console.log('Meal saved successfully');

    return mealData;
  } catch (error) {
    console.error('Error:', error);
  }
};

export default saveAsMealGroupedByDate;
