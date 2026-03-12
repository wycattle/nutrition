import { Pool } from 'pg';
import { IRecipex } from '../types_interfaces/interfaces';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const RecipeService = {
  async getAll(userId: string): Promise<IRecipex[]> {
    const result = await pool.query(
      `SELECT name, details, category FROM user_recipes WHERE user_id = $1 ORDER BY name`,
      [userId]
    );
    return result.rows;
  },

  async getByName(userId: string, name: string): Promise<IRecipex | undefined> {
    const result = await pool.query(
      `SELECT name, details, category FROM user_recipes WHERE user_id = $1 AND name = $2`,
      [userId, name]
    );
    return result.rows[0];
  },

  async save(userId: string, recipe: IRecipex): Promise<IRecipex> {
    await pool.query(
      `INSERT INTO user_recipes (user_id, name, details, category)
       VALUES ($1, $2, $3::jsonb, $4)
       ON CONFLICT (user_id, name) DO UPDATE
         SET details = EXCLUDED.details, category = EXCLUDED.category`,
      [userId, recipe.name, JSON.stringify(recipe.details), recipe.category ?? null]
    );
    return recipe;
  },

  async delete(userId: string, name: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM user_recipes WHERE user_id = $1 AND name = $2 RETURNING name`,
      [userId, name]
    );
    return result.rowCount > 0;
  }
};

export default RecipeService;