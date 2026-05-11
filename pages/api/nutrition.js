// pages/api/nutrition.js
import { Pool } from 'pg';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * API Route: /api/nutrition
 *
 * Always returns fresh nutrition data by disabling HTTP caching.
 * This prevents browsers and SWR from receiving 304 Not Modified responses,
 * ensuring that the latest nutrition and recipe changes are reflected immediately
 * in the UI (e.g., food group dropdowns, meal creation, etc).
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
 */

export default async function handler(req, res) {
  // Disable HTTP caching for this endpoint to always return fresh data
  res.setHeader('Cache-Control', 'no-store, must-revalidate');

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Identify the user
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Look up their UUID
    const userResult = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [session.user.email]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userResult.rows[0].id;

    // Return THIS user's personal nutrition table
    const result = await pool.query(
      `SELECT id, desc1, desc2, portion, calories, carb, fat,
              protein, fiber, gi AS "GI", note
       FROM user_nutrition
       WHERE user_id = $1
       ORDER BY id`,
      [userId]
    );
    res.status(200).json(result.rows);

  } catch (error) {
    console.error('Error fetching user nutrition data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}