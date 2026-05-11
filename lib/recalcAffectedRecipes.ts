// lib/recalcAffectedRecipes.ts
// When an ingredient in user_nutrition is changed, finds all recipes that use
// that ingredient (matched by desc1 + desc2), recalculates their macros from
// the current nutrition data, and updates user_nutrition with the new per-100g values.

import { Pool } from 'pg';
import { calculateTotals, calculatePer100g } from '../utils/methods';
import { IMealDetail } from '../types_interfaces/interfaces';

export async function recalcAffectedRecipes(
  pool: Pool,
  userId: string,
  desc1: string,
  desc2: string
): Promise<string[]> {
  // 1. Find all recipes that contain this ingredient in their details JSONB array
  const affectedResult = await pool.query(
    `SELECT name, details, category
     FROM user_recipes
     WHERE user_id = $1
       AND EXISTS (
         SELECT 1 FROM jsonb_array_elements(details) elem
         WHERE elem->>'desc1' = $2 AND elem->>'desc2' = $3
       )`,
    [userId, desc1, desc2]
  );

  if (affectedResult.rows.length === 0) return [];

  const updatedRecipes: string[] = [];

  for (const recipe of affectedResult.rows) {
    const storedDetails: IMealDetail[] = recipe.details;

    // 2. Collect unique ingredient (desc1, desc2) pairs in this recipe
    const pairs = storedDetails.map((d: IMealDetail) => ({ desc1: d.desc1, desc2: d.desc2 }));

    if (pairs.length === 0) continue;

    // 3. Fetch the latest per-100g nutrition values for all ingredients in one query
    const orClauses = pairs.map((_, i) => `(desc1 = $${i * 2 + 2} AND desc2 = $${i * 2 + 3})`).join(' OR ');
    const values: (string | null)[] = [userId];
    pairs.forEach(p => values.push(p.desc1, p.desc2));

    const nutritionResult = await pool.query(
      `SELECT desc1, desc2, calories, carb, fat, protein, fiber
       FROM user_nutrition
       WHERE user_id = $1 AND (${orClauses})`,
      values
    );

    // Build lookup map: "desc1||desc2" -> latest nutrition row
    const lookup: Record<string, { calories: number; carb: number; fat: number; protein: number; fiber: number }> = {};
    for (const row of nutritionResult.rows) {
      lookup[`${row.desc1}||${row.desc2}`] = row;
    }

    // 4. Rebuild details using stored portions × latest per-100g nutrition values
    const updatedDetails: IMealDetail[] = storedDetails.map((d: IMealDetail) => {
      const key = `${d.desc1}||${d.desc2}`;
      const latest = lookup[key];
      if (!latest) return d; // ingredient not found — keep stored values
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

    // 5. Recalculate recipe-level totals and per-100g values
    const totals = calculateTotals(updatedDetails);
    const per100g = calculatePer100g(totals);

    // 6. Save updated details back to user_recipes
    await pool.query(
      `UPDATE user_recipes SET details = $1::jsonb WHERE user_id = $2 AND name = $3`,
      [JSON.stringify(updatedDetails), userId, recipe.name]
    );

    // 7. Update the recipe's aggregate row in user_nutrition (the per-100g entry)
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

    updatedRecipes.push(recipe.name);
  }

  return updatedRecipes;
}
