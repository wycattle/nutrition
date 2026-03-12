import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Simple read-only lookup — never seeds, never writes
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const result = await pool.query(
    `SELECT id FROM users WHERE email = $1`,
    [session.user.email]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json({ id: result.rows[0].id });
}
