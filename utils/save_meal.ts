// utils/save_meal.ts

import { saveMeal } from '../lib/db';

const saveMealData = async (nomen: string, date: Date, items: any[])  => {
  console.log('saveMealData called with:', nomen, date, items);

  const mealData = {
    name: nomen,
    date: date,
    items: items
  };

  console.log('mealData:', mealData);

  try {
    await saveMeal(mealData);

    console.log('Meal saved successfully');

    return mealData;
  } catch (error) {
    console.error('Error:', error);
  }
};

export default saveMealData;