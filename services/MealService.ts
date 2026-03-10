import { IMealx } from '../types_interfaces/interfaces';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const mealInstance = {
  async createMeal(mealData: IMealx): Promise<IMealx> {
    // Extract just the time part from the timestamp (as HH:mm:ss or similar)
    const timeOnly = mealData.timestamp ? new Date(mealData.timestamp).toISOString().slice(11, 19) : null;
    await pool.query(
      `INSERT INTO user_meals (user_id, date, time, details, timestamp)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        mealData.user_id,
        mealData.date,                          // 'YYYY-MM-DD'  → DATE ✅
        timeOnly,                               // Only the time part (HH:mm:ss) → TIME ✅
        JSON.stringify(mealData.details),       // explicit serialize → JSONB ✅
        mealData.timestamp                      // full ISO string for TIMESTAMPTZ ✅
      ]
    );
    return mealData;
  }
};

export default mealInstance;