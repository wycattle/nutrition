// pages/api/admin/recalc_all_recipes.ts
// One-shot endpoint: recalculates ALL recipes for the authenticated user
// using the latest nutrition data from user_nutrition.

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '../../../utils/getAuthenticatedUser';
import { Pool } from 'pg';
import { calculateTotals, calculatePer100g } from '../../../utils/methods';
import { IMealDetail } from '../../../types_interfaces/interfaces';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  let userId: string;
  try {
    ({ userId } = await getAuthenticatedUser(req, res));
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // 1. Load all recipes for this user
    const recipesResult = await pool.query(
      `SELECT name, details, category FROM user_recipes WHERE user_id = $1`,
      [userId]
    );

    if (recipesResult.rows.length === 0) {
      return res.status(200).json({ message: 'No recipes found', updated: [] });
    }

    // 2. Load all nutrition rows for this user in one query
    const nutritionResult = await pool.query(
      `SELECT desc1, desc2, calories, carb, fat, protein, fiber FROM user_nutrition WHERE user_id = $1`,
      [userId]
    );

    const lookup: Record<string, { calories: number; carb: number; fat: number; protein: number; fiber: number }> = {};
    for (const row of nutritionResult.rows) {
      lookup[`${row.desc1}||${row.desc2}`] = row;
    }

    const updated: string[] = [];
    const skipped: string[] = [];

    for (const recipe of recipesResult.rows) {
      const storedDetails: IMealDetail[] = recipe.details;
      if (!storedDetails || storedDetails.length === 0) { skipped.push(recipe.name); continue; }

      // 3. Rebuild details using stored portions × latest per-100g nutrition values
      const updatedDetails: IMealDetail[] = storedDetails.map((d: IMealDetail) => {
        const key = `${d.desc1}||${d.desc2}`;
        const latest = lookup[key];
        if (!latest) return d; // ingredient not in nutrition table — keep stored values
        const p = d.portion ?? 0;
        return {
          ...d,
          calories: Number(((latest.calories || 0) * p).toFixed(2)),
          carb:     Number(((latest.carb     || 0) * p).toFixed(2)),
          fat:      Number(((latest.fat      || 0) * p).toFixed(2)),
          protein:  Number(((latest.protein  || 0) * p).toFixed(2)),
          fiber:    Number(((latest.fiber    || 0) * p).toFixed(2)),
        };
      });

      // 4. Recalculate totals and per-100g
      const totals = calculateTotals(updatedDetails);
      const per100g = calculatePer100g(totals);

      // 5. Update user_recipes with refreshed details
      await pool.query(
        `UPDATE user_recipes SET details = $1::jsonb WHERE user_id = $2 AND name = $3`,
        [JSON.stringify(updatedDetails), userId, recipe.name]
      );

      // 6. Replace the recipe's aggregate row in user_nutrition
      await pool.query(
        `DELETE FROM user_nutrition WHERE user_id = $1 AND desc1 = $2 AND desc2 = $3`,
        [userId, recipe.category ?? 'recipe', recipe.name]
      );
      await pool.query(
        `INSERT INTO user_nutrition (user_id, desc1, desc2, portion, calories, carb, fat, protein, fiber, note)
         VALUES ($1, $2, $3, 1, $4, $5, $6, $7, $8, $9)`,
        [userId, recipe.category ?? 'recipe', recipe.name,
         per100g.caloriesPer100g, per100g.carbPer100g, per100g.fatPer100g,
         per100g.proteinPer100g, per100g.fiberPer100g, recipe.category ?? '']
      );

      updated.push(recipe.name);
    }

    return res.status(200).json({ message: `Recalculated ${updated.length} recipe(s)`, updated, skipped });
  } catch (error) {
    console.error('Error in recalc_all_recipes:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
