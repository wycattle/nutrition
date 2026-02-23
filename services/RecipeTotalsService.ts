import fs from 'fs';
import path from 'path';
import { IRecipeTotals } from '../types_interfaces/interfaces';

const DATA_PATH = 'lib/data/recipe_totals.json';

function readRecipeTotals(): IRecipeTotals[] {
  if (!fs.existsSync(DATA_PATH)) return [];
  const data = fs.readFileSync(DATA_PATH, 'utf8');
  try {
    return JSON.parse(data) as IRecipeTotals[];
  } catch {
    return [];
  }
}

function writeRecipeTotals(totals: IRecipeTotals[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(totals, null, 2), 'utf8');
}

const RecipeTotalsService = {
  getAll(): IRecipeTotals[] {
    return readRecipeTotals();
  },

  save(total: IRecipeTotals): IRecipeTotals {
    const totals = readRecipeTotals();
    // Use name as unique key
    const idx = totals.findIndex(t => t.name === total.name);
    if (idx !== -1) {
      totals[idx] = total;
    } else {
      totals.push(total);
    }
    writeRecipeTotals(totals);
    return total;
  }
};

export default RecipeTotalsService;
