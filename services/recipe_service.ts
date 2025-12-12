import { IRecipex } from '../types/interfaces';

const Recipe_Instance = {
  async createMeal(Recipe: IRecipex): Promise<IRecipex> {
    // For now, just return the mealData.
    // Later, you can add DB logic here.
    return Recipe;
  }
};

export default Recipe_Instance;