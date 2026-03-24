// pages/api/meal_related/meal_totals_by_date.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/postgres';
import { getAuthenticatedUser } from '../../../utils/getAuthenticatedUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  let userId: string;
  try {
    ({ userId } = await getAuthenticatedUser(req, res));
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { start, end } = req.query;

  if (!start || !end || typeof start !== 'string' || typeof end !== 'string') {
    res.status(400).json({ message: 'Missing or invalid start/end date' });
    return;
  }

  // Query user_meal_totals which stores pre-aggregated totals per meal; group by date to get daily totals
  const sql = `
    SELECT
      date::date AS date,
      COALESCE(SUM(calories_tot), 0) AS "caloriesTot",
      COALESCE(SUM(carb_tot),     0) AS "carbTot",
      COALESCE(SUM(fat_tot),      0) AS "fatTot",
      COALESCE(SUM(fiber_tot),    0) AS "fiberTot",
      COALESCE(SUM(portion_tot),  0) AS "portionTot",
      COALESCE(SUM(protein_tot),  0) AS "proteinTot"
    FROM user_meal_totals
    WHERE user_id = $1 AND date::date BETWEEN $2::date AND $3::date
    GROUP BY date::date
    ORDER BY date::date
  `;

  try {
    const { rows } = await pool.query(sql, [userId, start, end]);
    // add an average row, as in FastAPI
    let totals = rows;
    if (totals.length > 0) {
      const avg = {
        date: 'Average',
        caloriesTot: 0,
        carbTot: 0,
        fatTot: 0,
        fiberTot: 0,
        portionTot: 0,
        proteinTot: 0,
      };
      for (const row of totals) {
        avg.caloriesTot += Number(row.caloriesTot) || 0;
        avg.carbTot     += Number(row.carbTot) || 0;
        avg.fatTot      += Number(row.fatTot) || 0;
        avg.fiberTot    += Number(row.fiberTot) || 0;
        avg.portionTot  += Number(row.portionTot) || 0;
        avg.proteinTot  += Number(row.proteinTot) || 0;
      }
      const n = totals.length;
      avg.caloriesTot = Math.round(avg.caloriesTot / n);
      avg.carbTot     = Math.round(avg.carbTot / n);
      avg.fatTot      = Math.round(avg.fatTot / n);
      avg.fiberTot    = Math.round(avg.fiberTot / n);
      avg.portionTot  = Math.round(avg.portionTot / n);
      avg.proteinTot  = Math.round(avg.proteinTot / n);
      totals = [...totals, avg];
    }
    res.status(200).json({ totals });
  } catch (error) {
    console.error('Error querying meal totals by date:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
