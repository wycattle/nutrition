// pages/api/meal_related/nutrient_totals_by_food.ts
// Queries Neon (Postgres) directly — no FastAPI required.
// Unpacks the JSONB `details` array in user_meals, then groups/sums by food.

import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { start, end } = req.query;

  if (!start || !end || typeof start !== 'string' || typeof end !== 'string') {
    res.status(400).json({ message: 'Missing or invalid start/end date' });
    return;
  }

  const sql = `
    SELECT
      item->>'desc1'                                  AS desc1,
      item->>'desc2'                                  AS desc2,
      COALESCE(SUM((item->>'portion')::numeric),  0)  AS portion,
      COALESCE(SUM((item->>'calories')::numeric), 0)  AS calories,
      COALESCE(SUM((item->>'carb')::numeric),     0)  AS carb,
      COALESCE(SUM((item->>'fat')::numeric),      0)  AS fat,
      COALESCE(SUM((item->>'protein')::numeric),  0)  AS protein,
      COALESCE(SUM((item->>'fiber')::numeric),    0)  AS fiber
    FROM user_meals,
      jsonb_array_elements(details) AS item
    WHERE date::date BETWEEN $1::date AND $2::date
    GROUP BY desc1, desc2
    ORDER BY desc1, calories DESC
  `;

  try {
    const { rows } = await pool.query(sql, [start, end]);
    res.status(200).json({ totals: rows });
  } catch (error) {
    console.error('Error querying nutrient totals by food:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
