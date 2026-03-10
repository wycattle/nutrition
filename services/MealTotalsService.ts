//services\MealTotalsService.ts
import { Pool } from 'pg';
import { IDailyMealTotalx } from '../types_interfaces/interfaces';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const MealTotalsService = {
  async getAll(): Promise<IDailyMealTotalx[]> {
    const result = await pool.query(
      `SELECT id, user_id, date,
              calories_tot AS "caloriesTot",
              carb_tot     AS "carbTot",
              fat_tot      AS "fatTot",
              fiber_tot    AS "fiberTot",
              portion_tot  AS "portionTot",
              protein_tot  AS "proteinTot"
       FROM user_meal_totals
       ORDER BY date`
    );
    return result.rows;
  },

  async getByDateRange(userId: string, start: string, end: string): Promise<IDailyMealTotalx[]> {
    // Group by date to ensure only one row per date is returned
    const result = await pool.query(
      `SELECT 
          MIN(id) as id, 
          user_id, 
          date,
          SUM(calories_tot) AS "caloriesTot",
          SUM(carb_tot)     AS "carbTot",
          SUM(fat_tot)      AS "fatTot",
          SUM(fiber_tot)    AS "fiberTot",
          SUM(portion_tot)  AS "portionTot",
          SUM(protein_tot)  AS "proteinTot"
       FROM user_meal_totals
       WHERE user_id = $1 AND date >= $2 AND date <= $3
       GROUP BY user_id, date
       ORDER BY date`,
      [userId, start, end]
    );
    return result.rows;
  },

  async save(total: IDailyMealTotalx): Promise<IDailyMealTotalx> {
    // Aggregate all meals for this user and date from user_meals
    const agg = await pool.query(
      `SELECT 
          SUM((details->0->>'calories')::numeric) AS "caloriesTot",
          SUM((details->0->>'carb')::numeric) AS "carbTot",
          SUM((details->0->>'fat')::numeric) AS "fatTot",
          SUM((details->0->>'fiber')::numeric) AS "fiberTot",
          SUM((details->0->>'portion')::numeric) AS "portionTot",
          SUM((details->0->>'protein')::numeric) AS "proteinTot"
       FROM user_meals
       WHERE user_id = $1 AND date = $2`,
      [total.user_id, total.date]
    );
    const row = agg.rows[0];
    // Upsert into user_meal_totals
    const result = await pool.query(
      `INSERT INTO user_meal_totals
         (user_id, date, timestamp, calories_tot, carb_tot, fat_tot, fiber_tot, portion_tot, protein_tot)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id, date, timestamp)
       DO UPDATE SET
         calories_tot = EXCLUDED.calories_tot,
         carb_tot = EXCLUDED.carb_tot,
         fat_tot = EXCLUDED.fat_tot,
         fiber_tot = EXCLUDED.fiber_tot,
         portion_tot = EXCLUDED.portion_tot,
         protein_tot = EXCLUDED.protein_tot
       RETURNING id`,
      [
        total.user_id,
        total.date,
        total.timestamp,
        row.caloriesTot || 0,
        row.carbTot || 0,
        row.fatTot || 0,
        row.fiberTot || 0,
        row.portionTot || 0,
        row.proteinTot || 0,
      ]
    );
    return { ...total, id: result.rows[0].id };
  }
};

export default MealTotalsService;
