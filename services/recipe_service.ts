import fs from 'fs';
import path from 'path';
import { IRecipex } from '../types_interfaces/interfaces';

const DATA_PATH = 'lib/data/recipes.json';

function readRecipes(): IRecipex[] {
  if (!fs.existsSync(DATA_PATH)) return [];
  const data = fs.readFileSync(DATA_PATH, 'utf8');
  try {
    return JSON.parse(data) as IRecipex[];
  } catch {
    return [];
  }
}

function writeRecipes(recipes: IRecipex[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(recipes, null, 2), 'utf8');
}

const RecipeService = {
  getAll(): IRecipex[] {
    return readRecipes();
  },

  getByName(name: string): IRecipex | undefined {
    return readRecipes().find(r => r.name === name);
  },

  save(recipe: IRecipex): IRecipex {
    const recipes = readRecipes();
    const idx = recipes.findIndex(r => r.name === recipe.name);
    if (idx !== -1) {
      recipes[idx] = recipe; // update
    } else {
      recipes.push(recipe); // create
    }
    writeRecipes(recipes);
    return recipe;
  },

  delete(name: string): boolean {
    const recipes = readRecipes();
    const filtered = recipes.filter(r => r.name !== name);
    if (filtered.length === recipes.length) return false;
    writeRecipes(filtered);
    return true;
  }
};

export default RecipeService;