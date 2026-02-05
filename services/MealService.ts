import { IMealx } from '../types_interfaces/interfaces';
import fs from 'fs';
import path from 'path';

const mealsFilePath = path.join(process.cwd(), 'lib', 'data', 'meals.json');

const mealInstance = {
  async createMeal(mealData: IMealx): Promise<IMealx> {
    let meals: IMealx[] = [];
    try {
      if (fs.existsSync(mealsFilePath)) {
        const fileData = fs.readFileSync(mealsFilePath, 'utf-8');
        meals = JSON.parse(fileData);
      }
    } catch (err) {
      // If file doesn't exist or is invalid, start with empty array
      meals = [];
    }
    meals.push(mealData);
    fs.writeFileSync(mealsFilePath, JSON.stringify(meals, null, 2), 'utf-8');
    return mealData;
  }
};

export default mealInstance;