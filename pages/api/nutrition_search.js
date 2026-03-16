import { Pool } from 'pg';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { search_word } = req.query;
  if (!search_word) return res.status(400).json({ error: 'Missing search_word' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const userResult = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [session.user.email]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userResult.rows[0].id;

    // Use trigram similarity for fuzzy search if available, fallback to ILIKE
    // This requires the pg_trgm extension in Postgres
    let result;
    try {
      result = await pool.query(
        `SELECT id, desc1, desc2
         FROM user_nutrition
         WHERE user_id = $1 AND (desc2 % $2 OR desc2 ILIKE $3)
         ORDER BY similarity(desc2, $2) DESC, id`,
        [userId, search_word, `%${search_word}%`]
      );
    } catch (e) {
      // Fallback if pg_trgm is not enabled
      result = await pool.query(
        `SELECT id, desc1, desc2
         FROM user_nutrition
         WHERE user_id = $1 AND desc2 ILIKE $2
         ORDER BY id`,
        [userId, `%${search_word}%`]
      );
    }
    res.status(200).json(result.rows);

  } catch (error) {
    console.error('Error searching user nutrition data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
