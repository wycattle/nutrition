// pages/api/recipe_related/nutrition_details.ts
// Returns per-100g lipid/mineral and vitamin totals for a recipe's ingredient list.
// Weights each ingredient by its portion (where portion=1 means 100g).

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '../../../utils/getAuthenticatedUser';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const LIPID_COLS = [
  'omega3', 'omega6', 'cholesterol_mg', 'sodium_mg', 'potassium_mg',
  'calcium_mg', 'iron_mg', 'magnesium_mg', 'iodine_mcg', 'manganese_mg',
  'selenium_mcg', 'zinc_mg',
];

const VITAMIN_COLS = [
  'vit_a_mcg', 'vit_b1_mg', 'vit_b2_mg', 'vit_b3_mg', 'vit_b5_mg',
  'vit_b6_mg', 'vit_b12_mcg', 'biotin_mcg', 'choline_mg', 'folate_mcg',
  'vit_c_mg', 'vit_d_mcg', 'vit_e_mg', 'vit_k_mcg',
];

const ALL_COLS = [...LIPID_COLS, ...VITAMIN_COLS];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  let userId: string;
  try {
    ({ userId } = await getAuthenticatedUser(req, res));
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { details } = req.body as { details: { desc1: string; desc2: string; portion: number }[] };
  if (!Array.isArray(details) || details.length === 0) {
    return res.status(400).json({ message: 'No details provided' });
  }

  try {
    // Fetch nutrition rows for all ingredients — use OR conditions for compatibility
    const colSelect = ALL_COLS.join(', ');
    const orClauses = details.map((_, i) => `(desc1 = $${i * 2 + 2} AND desc2 = $${i * 2 + 3})`).join(' OR ');
    const values: string[] = [userId];
    details.forEach(d => values.push(d.desc1, d.desc2));

    const sql = `
      SELECT desc1, desc2, ${colSelect}
      FROM user_nutrition
      WHERE user_id = $1
        AND (${orClauses})
    `;
    const result = await pool.query(sql, values);

    // Build a lookup map: "desc1||desc2" -> nutrient row
    const lookup: Record<string, Record<string, number>> = {};
    for (const row of result.rows) {
      const key = `${row.desc1}||${row.desc2}`;
      lookup[key] = row;
    }

    // Weighted sum across all ingredients
    const totalPortion = details.reduce((sum, d) => sum + (d.portion ?? 0), 0);
    const sums: Record<string, number> = {};
    ALL_COLS.forEach(col => { sums[col] = 0; });

    for (const ingredient of details) {
      const key = `${ingredient.desc1}||${ingredient.desc2}`;
      const row = lookup[key];
      if (!row) continue;
      const p = ingredient.portion ?? 0;
      ALL_COLS.forEach(col => {
        sums[col] += (Number(row[col]) || 0) * p;
      });
    }

    // Divide by total portion to get per-100g values
    const per100g: Record<string, number> = {};
    ALL_COLS.forEach(col => {
      per100g[col] = totalPortion > 0 ? Number((sums[col] / totalPortion).toFixed(3)) : 0;
    });

    res.status(200).json({ per100g, lipidCols: LIPID_COLS, vitaminCols: VITAMIN_COLS });
  } catch (err: any) {
    console.error('nutrition_details error:', err);
    res.status(500).json({ message: err.message });
  }
}
