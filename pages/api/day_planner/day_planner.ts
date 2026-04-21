import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '../../../utils/getAuthenticatedUser';
import { Pool } from 'pg';
import { IDayPlan } from '../../../types_interfaces/interfaces';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let userId: string;
  try {
    ({ userId } = await getAuthenticatedUser(req, res));
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const { name } = req.query;
      if (typeof name === 'string') {
        // Fetch one plan by name (full details)
        const result = await pool.query(
          `SELECT name, details, notes FROM day_planner WHERE user_id = $1 AND name = $2`,
          [userId, name]
        );
        if (result.rows.length > 0) {
          res.status(200).json(result.rows[0]);
        } else {
          res.status(404).json({ message: 'Plan not found' });
        }
      } else {
        // Fetch list of all plans for user (name + notes only, no details)
        const result = await pool.query(
          `SELECT name, notes FROM day_planner WHERE user_id = $1 ORDER BY name`,
          [userId]
        );
        res.status(200).json(result.rows);
      }

    } else if (req.method === 'POST') {
      const planData: IDayPlan = req.body;
      if (!planData.name || !Array.isArray(planData.details)) {
        return res.status(400).json({ message: 'Invalid plan data: name and details are required' });
      }

      await pool.query(
        `INSERT INTO day_planner (user_id, name, details, notes)
         VALUES ($1, $2, $3::jsonb, $4)
         ON CONFLICT (user_id, name) DO UPDATE
           SET details = EXCLUDED.details, notes = EXCLUDED.notes`,
        [userId, planData.name, JSON.stringify(planData.details), planData.notes ?? null]
      );

      res.status(200).json({ message: 'Plan saved', name: planData.name });

    } else if (req.method === 'DELETE') {
      const { name } = req.query;
      if (typeof name !== 'string') {
        return res.status(400).json({ message: 'Plan name required' });
      }
      await pool.query(
        `DELETE FROM day_planner WHERE user_id = $1 AND name = $2`,
        [userId, name]
      );
      res.status(200).json({ message: 'Plan deleted' });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in /api/day_planner/day_planner:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
