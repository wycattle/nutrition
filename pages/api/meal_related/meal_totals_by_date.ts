// pages/api/meal_related/meal_totals_by_date.ts

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

  // This SQL matches the FastAPI/pandas logic: group by date, sum nutrients, rename columns
  const sql = `
    WITH flat AS (
      SELECT
        date::date AS date,
        (item->>'calories')::numeric AS calories,
        (item->>'carb')::numeric AS carb,
        (item->>'fat')::numeric AS fat,
        (item->>'fiber')::numeric AS fiber,
        (item->>'portion')::numeric AS portion,
        (item->>'protein')::numeric AS protein
      FROM user_meals,
        jsonb_array_elements(details) AS item
      WHERE date::date BETWEEN $1::date AND $2::date
    )
    SELECT
      date,
      COALESCE(SUM(calories),0) AS "caloriesTot",
      COALESCE(SUM(carb),0)     AS "carbTot",
      COALESCE(SUM(fat),0)      AS "fatTot",
      COALESCE(SUM(fiber),0)    AS "fiberTot",
      COALESCE(SUM(portion),0)  AS "portionTot",
      COALESCE(SUM(protein),0)  AS "proteinTot"
    FROM flat
    GROUP BY date
    ORDER BY date
  `;

  try {
    const { rows } = await pool.query(sql, [start, end]);
    // Optionally add an average row, as in FastAPI
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
