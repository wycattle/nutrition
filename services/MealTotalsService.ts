import fs from 'fs';
import path from 'path';
import { IDailyMealTotalx } from '../types_interfaces/interfaces';

const DATA_PATH = path.join(process.cwd(), 'lib', 'data', 'meal_totals.json');

function readMealTotals(): IDailyMealTotalx[] {
  if (!fs.existsSync(DATA_PATH)) return [];
  const data = fs.readFileSync(DATA_PATH, 'utf8');
  try {
    return JSON.parse(data) as IDailyMealTotalx[];
  } catch {
    return [];
  }
}

function writeMealTotals(totals: IDailyMealTotalx[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(totals, null, 2), 'utf8');
}

const MealTotalsService = {
  getAll(): IDailyMealTotalx[] {
    return readMealTotals();
  },

  save(total: IDailyMealTotalx): IDailyMealTotalx {
    const totals = readMealTotals();
    // Use timestamp as unique key
    const idx = totals.findIndex(t => t.timestamp === total.timestamp);
    if (idx !== -1) {
      totals[idx] = total;
    } else {
      totals.push(total);
    }
    writeMealTotals(totals);
    return total;
  }
};

export default MealTotalsService;
