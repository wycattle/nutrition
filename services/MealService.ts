import { IMealx } from '../types/interfaces';

const mealInstance = {
  async createMeal(mealData: IMealx): Promise<IMealx> {
    // For now, just return the mealData.
    // Later, you can add DB logic here.
    return mealData;
  }
};

export default mealInstance;