
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '../../../utils/getAuthenticatedUser';
import { Pool } from 'pg';
import { IRecipex } from '../../../types_interfaces/interfaces';
import { calculateTotals, calculatePer100g } from '../../../utils/methods';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Authenticate ONCE at the top
  let userId: string;
  try {
    ({ userId } = await getAuthenticatedUser(req, res));
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const { name } = req.query;
      if (typeof name === 'string') {
        const result = await pool.query(
          `SELECT name, details, category FROM user_recipes WHERE user_id = $1 AND name = $2`,
          [userId, name]
        );
        if (result.rows.length > 0) {
          res.status(200).json(result.rows[0]);
        } else {
          res.status(404).json({ message: 'Recipe not found' });
        }
      } else {
        const result = await pool.query(
          `SELECT name, details, category FROM user_recipes WHERE user_id = $1 ORDER BY name`,
          [userId]
        );
        res.status(200).json(result.rows);
      }

    } else if (req.method === 'POST') {
      const recipeData: IRecipex = req.body;
      if (!recipeData.name || !Array.isArray(recipeData.details)) {
        return res.status(400).json({ message: 'Invalid recipe data' });
      }

      // Upsert into user_recipes
      await pool.query(
        `INSERT INTO user_recipes (user_id, name, details, category)
         VALUES ($1, $2, $3::jsonb, $4)
         ON CONFLICT (user_id, name) DO UPDATE
           SET details = EXCLUDED.details, category = EXCLUDED.category`,
        [userId, recipeData.name, JSON.stringify(recipeData.details), recipeData.category ?? null]
      );

      // Also upsert into user_nutrition so the recipe appears as a food item (per-100g values)
      const totals = calculateTotals(recipeData.details);
      const per100g = calculatePer100g(totals);
      await pool.query(
        `DELETE FROM user_nutrition WHERE user_id = $1 AND desc1 = 'recipe' AND desc2 = $2`,
        [userId, recipeData.name]
      );
      await pool.query(
        `INSERT INTO user_nutrition (user_id, desc1, desc2, portion, calories, carb, fat, protein, fiber, note)
         VALUES ($1, 'recipe', $2, 1, $3, $4, $5, $6, $7, $8)`,
        [userId, recipeData.name, per100g.caloriesPer100g, per100g.carbPer100g, per100g.fatPer100g,
         per100g.proteinPer100g, per100g.fiberPer100g, recipeData.category ?? '']
      );

      const recipeTotals = {
        name: recipeData.name,
        caloriesTot: totals.caloriesTot,
        carbTot: totals.carbTot,
        fatTot: totals.fatTot,
        fiberTot: totals.fiberTot,
        portionTot: totals.portionTot,
        proteinTot: totals.proteinTot,
      };
      res.status(200).json({ recipe: recipeData, message: 'Recipe saved', totals: recipeTotals });

    } else if (req.method === 'DELETE') {
      const { name } = req.query;
      if (typeof name !== 'string') return res.status(400).json({ message: 'Recipe name required' });

      await pool.query(
        `DELETE FROM user_recipes WHERE user_id = $1 AND name = $2`,
        [userId, name]
      );
      // Also remove from user_nutrition
      await pool.query(
        `DELETE FROM user_nutrition WHERE user_id = $1 AND desc1 = 'recipe' AND desc2 = $2`,
        [userId, name]
      );
      res.status(200).json({ message: 'Recipe deleted' });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in /api/recipe_related/recipes:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
